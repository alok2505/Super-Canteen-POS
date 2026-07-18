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
  location: {
    section: String,
    rack: String,
    shelf: String,
    bin: String
  },
});

const billSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", billSchema);