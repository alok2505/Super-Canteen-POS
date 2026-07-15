const mongoose = require("mongoose");

const holdBillSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      default: "Walk-in",
    },

    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        barcode: String,
        quantity: Number,
        mrp: Number,
        sellingPrice: Number,
      },
    ],

    grossAmount: Number,
    sellingAmount: Number,
    savings: Number,
    discount: Number,
    couponDiscount: Number,
    gst: Number,
    netAmount: Number,

    totalItems: Number,
    totalQuantity: Number,

    billNo: {
      type: String,
      sparse: true,
      trim: true,
    },

    customerMobile: {
      type: String,
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "Card", "UPI"],
      default: "Cash",
    },

    customerPaid: Number,
    changeReturned: Number,

    cashier: {
      type: String,
      default: "Admin",
    },

    status: {
      type: String,
      enum: ["HOLD", "COMPLETED"],
      default: "HOLD",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HoldBill", holdBillSchema);