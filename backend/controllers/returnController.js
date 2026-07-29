const asyncHandler = require("../middlewares/asyncHandler");
const Bill = require("../models/billModel");
const Return = require("../models/returnModel");
const FranchiseInventory = require("../models/franchiseInventoryModel");
const mongoose = require("mongoose");

// ===============================
// Search Bill
// POST /api/returns/search-bill
// ===============================
const searchBill = asyncHandler(async (req, res) => {
  const { billNo } = req.body;
  const franchiseId = req.user?.franchiseId;

  if (!billNo) {
    return res.status(400).json({ success: false, message: "Bill number is required." });
  }

  const query = { billNo };
  if (req.user?.role !== "Admin" && franchiseId) {
    query.franchiseId = franchiseId;
  }

  const bill = await Bill.findOne(query).populate("items.productId", "name images");

  if (!bill) {
    return res.status(404).json({ success: false, message: "Bill not found." });
  }

  res.json({ success: true, bill });
});

// ===============================
// Process Return
// POST /api/returns/process
// ===============================
const processReturn = asyncHandler(async (req, res) => {
  const { billId, items, refundMethod, reason } = req.body; // items: [{ _id (billItemId), barcode, returnedQty }]
  const franchiseId = req.user?.franchiseId;

  if (!billId || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid return request." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bill = await Bill.findById(billId).session(session);
    if (!bill) throw new Error("Bill not found.");

    if (req.user?.role !== "Admin" && bill.franchiseId.toString() !== franchiseId.toString()) {
      throw new Error("Cannot return a bill from another franchise.");
    }

    let totalRefundAmount = 0;
    const returnItems = [];
    let profitReduction = 0;
    let anyUpdates = false;

    for (const returnReq of items) {
      if (!returnReq.returnedQty || returnReq.returnedQty <= 0) continue;

      const billItem = bill.items.id(returnReq._id);
      if (!billItem) throw new Error(`Item ${returnReq.barcode} not found in bill.`);
      
      const maxReturnable = billItem.quantity - (billItem.returnedQty || 0);
      if (returnReq.returnedQty > maxReturnable) {
        throw new Error(`Cannot return more than purchased for ${billItem.name}.`);
      }

      billItem.returnedQty = (billItem.returnedQty || 0) + returnReq.returnedQty;
      
      const itemRefund = returnReq.returnedQty * billItem.sellingPrice;
      totalRefundAmount += itemRefund;
      profitReduction += returnReq.returnedQty * (billItem.sellingPrice - billItem.purchasePrice);

      returnItems.push({
        productId: billItem.productId,
        name: billItem.name,
        barcode: billItem.barcode,
        batchNumber: billItem.batchNumber,
        inventoryId: billItem.inventoryId,
        purchasePrice: billItem.purchasePrice,
        sellingPrice: billItem.sellingPrice,
        returnedQty: returnReq.returnedQty,
        reason: reason || returnReq.reason || "Other",
      });

      // Restore Inventory
      if (billItem.inventoryId) {
        const batch = await FranchiseInventory.findById(billItem.inventoryId).session(session);
        if (batch) {
          batch.quantity += returnReq.returnedQty;
          batch.history.push({
            action: "ADJUSTED",
            quantityChange: returnReq.returnedQty,
            previousQuantity: batch.quantity - returnReq.returnedQty,
            newQuantity: batch.quantity,
            note: `Returned from Bill ${bill.billNo}`,
            performedBy: req.user._id,
          });
          await batch.save({ session });
        }
      } else {
        // Fallback: try to find an active batch with the same barcode
        const batch = await FranchiseInventory.findOne({
          franchiseId: bill.franchiseId,
          barcode: billItem.barcode,
          isActive: true
        }).session(session);
        if (batch) {
          batch.quantity += returnReq.returnedQty;
          batch.history.push({
            action: "ADJUSTED",
            quantityChange: returnReq.returnedQty,
            previousQuantity: batch.quantity - returnReq.returnedQty,
            newQuantity: batch.quantity,
            note: `Returned from Bill ${bill.billNo} (Fallback matching)`,
            performedBy: req.user._id,
          });
          await batch.save({ session });
        }
      }

      anyUpdates = true;
    }

    if (!anyUpdates) throw new Error("No valid items to return.");

    bill.totalProfit -= profitReduction;
    bill.netAmount -= totalRefundAmount;
    bill.refundAmount = (bill.refundAmount || 0) + totalRefundAmount;

    // Check status
    const allReturned = bill.items.every(i => i.returnedQty >= i.quantity);
    bill.status = allReturned ? "Returned" : "Partially Returned";

    await bill.save({ session });

    // Generate Return No
    const lastReturn = await Return.findOne().sort({ createdAt: -1 }).session(session);
    let nextNumber = 1;
    if (lastReturn?.returnNo) {
      const match = String(lastReturn.returnNo).match(/(\d+)$/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }
    const finalReturnNo = `RTN${String(nextNumber).padStart(5, "0")}`;

    const returnDoc = await Return.create([{
      returnNo: finalReturnNo,
      billId: bill._id,
      franchiseId: bill.franchiseId,
      returnedBy: req.user._id,
      items: returnItems,
      refundMethod,
      refundAmount: totalRefundAmount,
      status: "Completed",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Return processed successfully.",
      returnRecord: returnDoc[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ===============================
// Get Return By ID
// GET /api/returns/:id
// ===============================
const getReturnById = asyncHandler(async (req, res) => {
  const returnDoc = await Return.findById(req.params.id)
    .populate("billId")
    .populate("returnedBy", "username");

  if (!returnDoc) {
    return res.status(404).json({ success: false, message: "Return not found." });
  }

  res.json({ success: true, returnRecord: returnDoc });
});

// ===============================
// Get Returns By Bill ID
// GET /api/returns/bill/:billId
// ===============================
const getReturnsByBillId = asyncHandler(async (req, res) => {
  const returns = await Return.find({ billId: req.params.billId })
    .populate("returnedBy", "username");

  res.json({ success: true, returns });
});

// ===============================
// Get All Returns
// GET /api/returns
// ===============================
const getReturns = asyncHandler(async (req, res) => {
  const franchiseId = req.user?.franchiseId;
  const query = {};
  
  if (req.user?.role !== "Admin" && franchiseId) {
    query.franchiseId = franchiseId;
  }

  const returns = await Return.find(query)
    .populate("billId", "billNo customerName customerMobile totalItems")
    .populate("returnedBy", "username")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: returns.length, returns });
});

module.exports = {
  searchBill,
  processReturn,
  getReturnById,
  getReturnsByBillId,
  getReturns,
};
