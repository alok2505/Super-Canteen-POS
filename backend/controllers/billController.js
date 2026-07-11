const asyncHandler = require("../middlewares/asyncHandler");
const Bill = require("../models/billModel");

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
    billNumber,
    customerName,
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

  let finalBillNo = billNo || billNumber;

  if (!finalBillNo) {
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastBill) {
      const lastBillNo = lastBill.billNo || lastBill.billNumber || "";
      const match = lastBillNo.match(/(\d+)$/);

      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    finalBillNo = `BILL${String(nextNumber).padStart(5, "0")}`;
  }

  const bill = await Bill.create({
    billNumber: finalBillNo,
    billNo: finalBillNo,

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
  const bills = await Bill.find().sort({
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