const asyncHandler = require("../middlewares/asyncHandler");
const FranchiseInventory = require("../models/franchiseInventoryModel");
const Product = require("../models/productModel");

const franchiseIdFor = (req) => req.user.franchiseId?.toString();

const findMasterVariant = (product, masterVariantId) => {
  if (!masterVariantId) return null;
  for (const variant of product.flatVariants || []) if (variant._id.toString() === masterVariantId) return { size: variant.size || "", barcode: variant.barcode, mrp: variant.mrp };
  for (const color of product.colorVariants || []) for (const size of color.sizes || []) if (size._id.toString() === masterVariantId) return { color: color.name || "", size: size.size || "", barcode: size.barcode, mrp: size.mrp };
  return undefined;
};

const listMyInventory = asyncHandler(async (req, res) => {
  const batches = await FranchiseInventory.find({ franchiseId: franchiseIdFor(req) })
    .populate("productId", "name barcode sku mrp images productType")
    .sort({ expiryDate: 1, createdAt: -1 }).lean();
  res.json({ success: true, batches: batches.filter((batch) => batch.productId) });
});

const receiveBatch = asyncHandler(async (req, res) => {
  const { productId, masterVariantId = "", barcode, batchNumber, quantity, purchasePrice, sellingPrice, manufactureDate, expiryDate, location = {} } = req.body;
  if (!productId || !barcode || !batchNumber || quantity === undefined || purchasePrice === undefined || sellingPrice === undefined) return res.status(400).json({ success: false, message: "Product, barcode, batch number, quantity, purchase price, and selling price are required." });
  if (![quantity, purchasePrice, sellingPrice].every((value) => Number.isFinite(Number(value)) && Number(value) >= 0)) return res.status(400).json({ success: false, message: "Quantity and prices must be valid non-negative numbers." });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: "Master product not found." });
  const variant = findMasterVariant(product, String(masterVariantId));
  if (masterVariantId && !variant) return res.status(400).json({ success: false, message: "Selected master variant no longer exists." });
  const stock = Number(quantity);
  const batch = await FranchiseInventory.create({ franchiseId: franchiseIdFor(req), productId, masterVariantId, color: variant?.color || "", size: variant?.size || "", barcode: String(barcode).trim(), batchNumber: String(batchNumber).trim(), quantity: stock, purchasePrice: Number(purchasePrice), sellingPrice: Number(sellingPrice), manufactureDate: manufactureDate || undefined, expiryDate: expiryDate || undefined, location, history: [{ action: "RECEIVED", quantityChange: stock, previousQuantity: 0, newQuantity: stock, performedBy: req.user._id }] });
  res.status(201).json({ success: true, batch });
});

const updateBatch = asyncHandler(async (req, res) => {
  const batch = await FranchiseInventory.findOne({ _id: req.params.batchId, franchiseId: franchiseIdFor(req) });
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found in your franchise." });
  const previousQuantity = batch.quantity;
  const { barcode, batchNumber, quantity, purchasePrice, sellingPrice, manufactureDate, expiryDate, location, note, isActive } = req.body;
  if (quantity !== undefined && (!Number.isFinite(Number(quantity)) || Number(quantity) < 0)) return res.status(400).json({ success: false, message: "Quantity cannot be negative." });
  if (purchasePrice !== undefined && (!Number.isFinite(Number(purchasePrice)) || Number(purchasePrice) < 0)) return res.status(400).json({ success: false, message: "Purchase price cannot be negative." });
  if (sellingPrice !== undefined && (!Number.isFinite(Number(sellingPrice)) || Number(sellingPrice) < 0)) return res.status(400).json({ success: false, message: "Selling price cannot be negative." });
  if (barcode !== undefined) batch.barcode = String(barcode).trim();
  if (batchNumber !== undefined) batch.batchNumber = String(batchNumber).trim();
  if (quantity !== undefined) batch.quantity = Number(quantity);
  if (purchasePrice !== undefined) batch.purchasePrice = Number(purchasePrice);
  if (sellingPrice !== undefined) batch.sellingPrice = Number(sellingPrice);
  if (manufactureDate !== undefined) batch.manufactureDate = manufactureDate || undefined;
  if (expiryDate !== undefined) batch.expiryDate = expiryDate || undefined;
  if (location) batch.location = location;
  if (isActive !== undefined) batch.isActive = Boolean(isActive);
  batch.history.push({ action: batch.quantity === previousQuantity ? "LOCATION_UPDATED" : "ADJUSTED", quantityChange: batch.quantity - previousQuantity, previousQuantity, newQuantity: batch.quantity, note: note || "", performedBy: req.user._id });
  await batch.save();
  res.json({ success: true, batch });
});

const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await FranchiseInventory.findOneAndDelete({ _id: req.params.batchId, franchiseId: franchiseIdFor(req) });
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found in your franchise." });
  res.json({ success: true, message: "Inventory batch deleted." });
});

module.exports = { listMyInventory, receiveBatch, updateBatch, deleteBatch };
