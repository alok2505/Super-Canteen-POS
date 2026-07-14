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
    gst: Number,
    netAmount: Number,

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