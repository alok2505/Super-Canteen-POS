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

  // Decrease the separate franchise stock atomically. A stale cart cannot sell
  // more than the store actually has.
  for (const item of items) {
    const isVariant = Boolean(item.inventoryVariantId);
    const result = await FranchiseInventory.findOneAndUpdate(
      isVariant
        ? { franchiseId, productId: item.productId, variants: { $elemMatch: { _id: item.inventoryVariantId, stock: { $gte: Number(item.quantity) } } } }
        : { franchiseId, productId: item.productId, stock: { $gte: Number(item.quantity) } },
      isVariant
        ? { $inc: { "variants.$.stock": -Number(item.quantity) } }
        : { $inc: { stock: -Number(item.quantity) } },
      { new: true },
    );
    if (!result) return res.status(400).json({ success: false, message: `${item.name || "Product"} no longer has enough stock.` });
    if (isVariant) {
      const variant = result.variants.id(item.inventoryVariantId);
      variant.history.push({ action: "SOLD", quantityChange: -Number(item.quantity), previousStock: variant.stock + Number(item.quantity), newStock: variant.stock, performedBy: req.user._id });
    } else {
      result.history.push({ action: "SOLD", quantityChange: -Number(item.quantity), previousStock: result.stock + Number(item.quantity), newStock: result.stock, performedBy: req.user._id });
    }
    await result.save();
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
