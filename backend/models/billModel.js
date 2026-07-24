const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "FranchiseInventory" },
  inventoryVariantId: { type: mongoose.Schema.Types.ObjectId },
  name: String,
  barcode: String,
  quantity: Number,
  mrp: Number,
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: Number,
  total: Number,
  profit: { type: Number, default: 0 },
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
    franchiseId: { type: mongoose.Schema.Types.ObjectId, ref: "Franchise", index: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [billItemSchema],

    grossAmount: Number,

    sellingAmount: Number,

    savings: Number,

    discount: Number,

    gst: Number,

    netAmount: Number,
    
    totalProfit: { type: Number, default: 0 },

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
