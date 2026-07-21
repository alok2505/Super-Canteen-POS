const asyncHandler = require("../middlewares/asyncHandler");
const Bill = require("../models/billModel");
const FranchiseInventory = require("../models/franchiseInventoryModel");

// ===============================
// Save Bill
// ===============================

const saveBill = asyncHandler(async (req, res) => {
  const {
    items,
    grossAmount,
    sellingAmount,
    savings,
    discount,
    couponDiscount,
    gst,
    netAmount,
    totalItems,
    totalQuantity,
    billNo,
    customerName,
    customerMobile,
    paymentMode,
    customerPaid,
    changeReturned,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No items found.",
    });
  }

  const franchiseId = req.user?.franchiseId;
  if (!franchiseId) return res.status(403).json({ success: false, message: "A franchise assignment is required to save a bill." });

  for (const item of items) {
    let remainingQuantity = Number(item.quantity);
    
    const batches = await FranchiseInventory.find({
      franchiseId,
      barcode: item.barcode,
      isActive: true,
      quantity: { $gt: 0 }
    }).sort({ expiryDate: 1, createdAt: 1 });

    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
    if (remainingQuantity > totalStock) {
      return res.status(400).json({ success: false, message: `${item.name || "Product"} no longer has enough stock.` });
    }

    for (const batch of batches) {
      if (remainingQuantity <= 0) break;

      const deductAmount = Math.min(batch.quantity, remainingQuantity);
      
      const updatedBatch = await FranchiseInventory.findOneAndUpdate(
        { _id: batch._id, quantity: { $gte: deductAmount } },
        { $inc: { quantity: -deductAmount } },
        { new: true }
      );

      if (!updatedBatch) {
        return res.status(400).json({ success: false, message: `Stock for ${item.name || "Product"} was updated during checkout. Please try again.` });
      }

      updatedBatch.history.push({
        action: "SOLD",
        quantityChange: -deductAmount,
        previousQuantity: updatedBatch.quantity + deductAmount,
        newQuantity: updatedBatch.quantity,
        note: `Sold in bill`,
        performedBy: req.user._id
      });
      await updatedBatch.save();

      remainingQuantity -= deductAmount;
    }
  }

  let finalBillNo = billNo;

  if (!finalBillNo) {
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastBill?.billNo) {
      const match = String(lastBill.billNo).match(/(\d+)$/);

      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    finalBillNo = `BILL${String(nextNumber).padStart(5, "0")}`;
  }

  const bill = await Bill.create({
    billNo: finalBillNo,
    franchiseId,
    cashierId: req.user._id,

    items,

    grossAmount,

    sellingAmount,

    savings,

    discount,

    couponDiscount,

    gst,

    netAmount,

    totalItems,

    totalQuantity,

    customerName: customerName || "Walk-in",

    customerMobile,

    paymentMode,

    customerPaid,

    changeReturned,
  });

  res.status(201).json({
    success: true,
    message: "Bill saved successfully.",
    bill,
  });
});

// ===============================
// Get All Bills
// ===============================

const getBills = asyncHandler(async (req, res) => {
  const query = req.user?.role === "Admin" ? {} : { franchiseId: req.user?.franchiseId };
  const bills = await Bill.find(query).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    count: bills.length,
    bills,
  });
});

// ===============================
// Get Single Bill
// ===============================

const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: "Bill not found.",
    });
  }

  res.json({
    success: true,
    bill,
  });
});

// ===============================
// Delete Bill
// ===============================

const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: "Bill not found.",
    });
  }

  await bill.deleteOne();

  res.json({
    success: true,
    message: "Bill deleted successfully.",
  });
});

module.exports = {
  saveBill,
  getBills,
  getBillById,
  deleteBill,
};
