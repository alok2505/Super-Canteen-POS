const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  section: { type: String, default: "" }, rack: { type: String, default: "" },
  shelf: { type: String, default: "" }, bin: { type: String, default: "" },
}, { _id: false });

const historySchema = new mongoose.Schema({
  action: { type: String, enum: ["RECEIVED", "ADJUSTED", "SOLD", "LOCATION_UPDATED"], required: true },
  quantityChange: { type: Number, default: 0 }, previousQuantity: { type: Number, default: 0 }, newQuantity: { type: Number, default: 0 },
  note: { type: String, default: "" }, performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// One document is one received batch. This uses a new collection so existing
// embedded/legacy inventory data remains untouched during the migration.
const franchiseInventorySchema = new mongoose.Schema({
  franchiseId: { type: mongoose.Schema.Types.ObjectId, ref: "Franchise", required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  masterVariantId: { type: String, default: "" },
  color: { type: String, default: "" }, size: { type: String, default: "" },
  barcode: { type: String, required: true, index: true },
  batchNumber: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  manufactureDate: { type: Date }, expiryDate: { type: Date },
  location: { type: locationSchema, default: () => ({}) },
  isActive: { type: Boolean, default: true },
  history: [historySchema],
}, { timestamps: true, collection: "franchise_inventory_batches" });

franchiseInventorySchema.index({ franchiseId: 1, productId: 1, masterVariantId: 1, batchNumber: 1 }, { unique: true });
franchiseInventorySchema.index({ franchiseId: 1, barcode: 1, expiryDate: 1 });

module.exports = mongoose.model("FranchiseInventory", franchiseInventorySchema);
