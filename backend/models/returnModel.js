const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  barcode: String,
  batchNumber: String,
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "FranchiseInventory" },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  returnedQty: { type: Number, required: true },
  reason: { type: String },
});

const returnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      unique: true,
      required: true,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [returnItemSchema],
    refundMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Wallet", "Store Credit"],
      required: true,
    },
    refundAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed"],
      default: "Completed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Return", returnSchema);
