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
  returnedQty: { type: Number, default: 0 },
  batchNumber: String,
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

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customerName: {
      type: String,
      default: "Walk-in",
    },

    customerMobile: {
      type: String,
    },

    appliedOffers: [{
      offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
      name: { type: String },
      discountAmount: { type: Number, default: 0 },
      freeProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    }],

    totalSavings: {
      type: Number,
      default: 0,
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

    refundAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Completed", "Partially Returned", "Returned"],
      default: "Completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", billSchema);
