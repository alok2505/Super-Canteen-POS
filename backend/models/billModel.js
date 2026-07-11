const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  name: String,
  barcode: String,
  quantity: Number,
  mrp: Number,
  sellingPrice: Number,
  total: Number,
});

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      trim: true,
    },

    billNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    items: [billItemSchema],

    grossAmount: Number,

    sellingAmount: Number,

    savings: Number,

    discount: Number,

    gst: Number,

    netAmount: Number,

    totalItems: Number,

    totalQuantity: Number,

    customerName: {
      type: String,
      default: "Walk-in",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", billSchema);