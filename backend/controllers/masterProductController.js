const asyncHandler = require("../middlewares/asyncHandler");
const Product = require("../models/productModel");

const listMasterProducts = asyncHandler(async (req, res) => {
  const query = req.query.search ? {
    $or: [
      { name: { $regex: req.query.search, $options: "i" } },
      { barcode: { $regex: req.query.search, $options: "i" } },
      { sku: { $regex: req.query.search, $options: "i" } },
    ],
  } : {};
  const products = await Product.find(query).select("name barcode sku brand category tax mrp images productType hasVariants flatVariants colorVariants").sort({ createdAt: -1 }).lean();
  res.json({ success: true, products });
});

const createMasterProduct = asyncHandler(async (req, res) => {
  const { name, barcode, sku, mrp, brand, category, tax = 0, image = "" } = req.body;
  if (!name || !barcode || mrp === undefined) {
    return res.status(400).json({ success: false, message: "Name, barcode, and MRP are required." });
  }
  const product = await Product.create({
    name: name.trim(), barcode: barcode.trim(), sku: sku?.trim() || undefined,
    mrp: Number(mrp), offerPrice: Number(mrp), tax: Number(tax),
    brand: brand || undefined, category: category || undefined,
    images: image ? [image] : [], productType: "Single", hasVariants: false,
    countInStock: 0, createdBy: req.user._id,
  });
  res.status(201).json({ success: true, product });
});

const updateMasterProduct = asyncHandler(async (req, res) => {
  const { name, barcode, sku, mrp, tax, image } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Master product not found." });
  if (name !== undefined) product.name = name.trim();
  if (barcode !== undefined) product.barcode = barcode.trim();
  if (sku !== undefined) product.sku = sku.trim() || undefined;
  if (mrp !== undefined) product.mrp = Number(mrp);
  if (tax !== undefined) product.tax = Number(tax);
  if (image !== undefined) product.images = image ? [image] : [];
  await product.save();
  res.json({ success: true, product });
});

const deleteMasterProduct = asyncHandler(async (req, res) => {
  const FranchiseInventory = require("../models/franchiseInventoryModel");
  const inventoryCount = await FranchiseInventory.countDocuments({ productId: req.params.productId });
  if (inventoryCount) return res.status(400).json({ success: false, message: "This master product is in franchise inventory and cannot be deleted." });
  const product = await Product.findByIdAndDelete(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Master product not found." });
  res.json({ success: true, message: "Master product deleted." });
});

module.exports = { listMasterProducts, createMasterProduct, updateMasterProduct, deleteMasterProduct };
