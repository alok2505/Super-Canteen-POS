const asyncHandler = require("../middlewares/asyncHandler");
const Product = require("../models/productModel");
const { deleteOldImages } = require("../utils/imageUtils");

// listMasterProducts
// Returns all master products with variant data so the frontend
// can display type badges and variant counts in the product table.
const listMasterProducts = asyncHandler(async (req, res) => {
  const query = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { barcode: { $regex: req.query.search, $options: "i" } },
          { sku: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const products = await Product.find(query)
    .select("name barcode sku brand category tax mrp offerPrice images productType hasVariants flatVariants colorVariants countInStock")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, products });
});

// createMasterProduct
// Creates a new master product in the global catalogue.
// Supports all three product types:
//   Single    — one barcode, one price
//   WeightPack— multiple flat variants (e.g. 250g, 500g, 1kg)
//   ColorSize — multiple color variants, each with multiple sizes
// After creation the product is available for StoreManagers
// to pull into their franchise inventory via the Catalog page.
const createMasterProduct = asyncHandler(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const {
    name, barcode, sku, mrp, offerPrice,
    brand, category, tax = 0, image = "",
    productType = "Single",
    hasVariants = false,
    flatVariants = [],
    colorVariants = [],
  } = payload;

  if (!name) {
    return res.status(400).json({ success: false, message: "Product name is required." });
  }

  // Single products MUST have a barcode and MRP
  if (productType === "Single" && (!barcode || mrp === undefined)) {
    return res.status(400).json({ success: false, message: "Barcode and MRP are required for Single products." });
  }

  // WeightPack products must have at least one flat variant
  if (productType === "WeightPack" && (!flatVariants || flatVariants.length === 0)) {
    return res.status(400).json({ success: false, message: "At least one variant is required for WeightPack products." });
  }

  // ColorSize products must have at least one color with at least one size
  if (productType === "ColorSize" && (!colorVariants || colorVariants.length === 0)) {
    return res.status(400).json({ success: false, message: "At least one color variant is required for ColorSize products." });
  }

  const product = await Product.create({
    name: name.trim(),
    productType,
    hasVariants: productType !== "Single",

    // Single fields (ignored by schema pre-save hook for variant products)
    barcode: productType === "Single" ? barcode?.trim() : undefined,
    sku: productType === "Single" ? (sku?.trim() || undefined) : undefined,
    mrp: productType === "Single" ? Number(mrp) : 0,
    offerPrice: productType === "Single" ? Number(offerPrice || mrp) : 0,

    // Variant fields (cleared by schema pre-save hook for non-matching types)
    flatVariants: productType === "WeightPack" ? flatVariants : [],
    colorVariants: productType === "ColorSize" ? colorVariants : [],

    tax: Number(tax),
    brand: brand || undefined,
    category: category || undefined,
    images: image ? [image] : [],
    countInStock: 0,
    createdBy: req.user._id,
  });

  const files = req.files || (req.file ? [req.file] : []);
  
  const rootFiles = files.filter(f => f.fieldname === "images");
  if (rootFiles.length > 0) {
    product.images = rootFiles.map(f => `/uploads/products/${f.filename}`);
  }

  if (product.productType === "ColorSize" && product.colorVariants) {
    product.colorVariants.forEach((c, idx) => {
      const payloadColor = payload.colorVariants?.[idx];
      if (payloadColor?.useMasterImage) {
        c.images = [...(product.images || [])];
      } else {
        const colorFiles = files.filter(f => f.fieldname === `colorImages_${idx}`);
        if (colorFiles.length > 0) {
          c.images = colorFiles.map(f => `/uploads/products/${f.filename}`);
        }
      }
    });
  } else if (product.productType === "WeightPack" && product.flatVariants) {
    product.flatVariants.forEach((v, idx) => {
      const payloadVariant = payload.flatVariants?.[idx];
      if (payloadVariant?.useMasterImage) {
        v.images = [...(product.images || [])];
      } else {
        const flatFiles = files.filter(f => f.fieldname === `flatImages_${idx}`);
        if (flatFiles.length > 0) {
          v.images = flatFiles.map(f => `/uploads/products/${f.filename}`);
        }
      }
    });
  }

  await product.save();

  res.status(201).json({ success: true, product });
});

// updateMasterProduct
// Updates an existing master product including variant data.
// Admin can change the product type, add/remove variants,
// and update pricing and stock for each variant.
const updateMasterProduct = asyncHandler(async (req, res) => {
  console.log("Controller reached");
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const {
    name, barcode, sku, mrp, offerPrice, tax, image,
    productType, hasVariants, flatVariants, colorVariants,
  } = payload;

  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Master product not found." });
  }

  if (name !== undefined) product.name = name.trim();
  if (tax !== undefined) product.tax = Number(tax);
  if (image !== undefined) product.images = image ? [image] : [];


  // Update product type and variant data if provided
  if (productType !== undefined) {
    product.productType = productType;
    product.hasVariants = productType !== "Single";

    if (productType === "Single") {
      if (barcode !== undefined) product.barcode = barcode.trim();
      if (sku !== undefined) product.sku = sku.trim() || undefined;
      if (mrp !== undefined) product.mrp = Number(mrp);
      if (offerPrice !== undefined) product.offerPrice = Number(offerPrice);
      product.flatVariants = [];
      product.colorVariants = [];

    } else if (productType === "WeightPack") {
      if (flatVariants !== undefined) product.flatVariants = flatVariants;
      product.colorVariants = [];
      // Clear single-product fields
      product.barcode = undefined;

    } else if (productType === "ColorSize") {
      if (colorVariants !== undefined) product.colorVariants = colorVariants;
      product.flatVariants = [];
      product.barcode = undefined;
    }
  } else {
    // productType not changing — just update scalar fields for Single
    if (barcode !== undefined) product.barcode = barcode.trim();
    if (sku !== undefined) product.sku = sku.trim() || undefined;
    if (mrp !== undefined) product.mrp = Number(mrp);
    if (offerPrice !== undefined) product.offerPrice = Number(offerPrice);
    if (flatVariants !== undefined) product.flatVariants = flatVariants;
    if (colorVariants !== undefined) product.colorVariants = colorVariants;
  }

  console.log("Payload:", payload);
  const files = req.files || (req.file ? [req.file] : []);
  
  const rootFiles = files.filter(f => f.fieldname === "images");
  if (rootFiles.length > 0) {
    deleteOldImages(product.images);
    product.images = rootFiles.map(f => `/uploads/products/${f.filename}`);
  }

  if (product.productType === "ColorSize" && product.colorVariants) {
    product.colorVariants.forEach((c, idx) => {
      const payloadColor = payload.colorVariants?.[idx];
      if (payloadColor?.useMasterImage) {
        if (c.images && c.images.length > 0 && c.images[0] !== product.images?.[0]) {
           deleteOldImages(c.images);
        }
        c.images = [...(product.images || [])];
      } else {
        const colorFiles = files.filter(f => f.fieldname === `colorImages_${idx}`);
        if (colorFiles.length > 0) {
          if (c.images && c.images.length > 0 && c.images[0] !== product.images?.[0]) deleteOldImages(c.images);
          c.images = colorFiles.map(f => `/uploads/products/${f.filename}`);
        }
      }
    });
  } else if (product.productType === "WeightPack" && product.flatVariants) {
    product.flatVariants.forEach((v, idx) => {
      const payloadVariant = payload.flatVariants?.[idx];
      if (payloadVariant?.useMasterImage) {
        if (v.images && v.images.length > 0 && v.images[0] !== product.images?.[0]) {
           deleteOldImages(v.images);
        }
        v.images = [...(product.images || [])];
      } else {
        const flatFiles = files.filter(f => f.fieldname === `flatImages_${idx}`);
        if (flatFiles.length > 0) {
          if (v.images && v.images.length > 0 && v.images[0] !== product.images?.[0]) deleteOldImages(v.images);
          v.images = flatFiles.map(f => `/uploads/products/${f.filename}`);
        }
      }
    });
  }

  await product.save();
  res.json({ success: true, product });
});

// deleteMasterProduct
// Hard-deletes a master product.
// Blocked if the product is referenced in any franchise inventory batch.
const deleteMasterProduct = asyncHandler(async (req, res) => {
  const FranchiseInventory = require("../models/franchiseInventoryModel");
  const inventoryCount = await FranchiseInventory.countDocuments({ productId: req.params.productId });
  if (inventoryCount) {
    return res.status(400).json({
      success: false,
      message: `This product is in franchise inventory (${inventoryCount} batch${inventoryCount !== 1 ? "es" : ""}) and cannot be deleted.`,
    });
  }
  const product = await Product.findByIdAndDelete(req.params.productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Master product not found." });
  }
  res.json({ success: true, message: "Master product deleted." });
});

module.exports = { listMasterProducts, createMasterProduct, updateMasterProduct, deleteMasterProduct };
