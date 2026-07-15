const asyncHandler = require("../middlewares/asyncHandler");
const HoldBill = require("../models/holdBillModel");

// =====================================
// Save Hold Bill
// POST /api/hold-bills
// =====================================

const saveHoldBill = asyncHandler(async (req, res) => {
  const {
    customerName = "Walk-in",
    customerMobile,
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
    paymentMode,
    customerPaid,
    changeReturned,
    cashier,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  const holdBill = await HoldBill.create({
    customerName,
    customerMobile,
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
    paymentMode,
    customerPaid,
    changeReturned,
    cashier,
  });

  res.status(201).json({
    success: true,
    message: "Bill placed on hold successfully.",
    holdBill,
  });
});

// =====================================
// Get All Hold Bills
// GET /api/hold-bills
// =====================================

const getHoldBills = asyncHandler(async (req, res) => {
  const holdBills = await HoldBill.find().sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    count: holdBills.length,
    holdBills,
  });
});

// =====================================
// Get Hold Bill By Id
// GET /api/hold-bills/:id
// =====================================

const getHoldBillById = asyncHandler(async (req, res) => {
  const holdBill = await HoldBill.findById(req.params.id);

  if (!holdBill) {
    return res.status(404).json({
      success: false,
      message: "Hold bill not found.",
    });
  }

  res.json({
    success: true,
    holdBill,
  });
});

// =====================================
// Delete Hold Bill
// DELETE /api/hold-bills/:id
// =====================================

const deleteHoldBill = asyncHandler(async (req, res) => {
  const holdBill = await HoldBill.findById(req.params.id);

  if (!holdBill) {
    return res.status(404).json({
      success: false,
      message: "Hold bill not found.",
    });
  }

  await holdBill.deleteOne();

  res.json({
    success: true,
    message: "Hold bill deleted successfully.",
  });
});

module.exports = {
  saveHoldBill,
  getHoldBills,
  getHoldBillById,
  deleteHoldBill,
};