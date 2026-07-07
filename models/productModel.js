const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

// ✅ Review Schema
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: ObjectId, required: true, ref: "User" },
  },
  { timestamps: true },
);

// ✅ Size Schema (nested under color)
const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true }, // Can be "S", "M", "L", "250g", "500ml", etc.
  mrp: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  countInStock: { type: Number, default: 0 },
  sku: { type: String },
  barcode: { type: String, unique: true, sparse: true }, // Optional unique barcode for each size variant
  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number },
  variantStockThreshold: { type: Number, default: 5 },
});

// ✅ Color Variant Schema (for clothing/footwear)
const colorVariantSchema = new mongoose.Schema({
  name: { type: String }, // Red, Blue, etc.
  code: { type: String }, // HEX color code
  images: [{ type: String }],
  
  sizes: [sizeSchema], // multiple sizes under this color
});

// ✅ Flat Variant Schema (for weight/pack products) - SIMPLIFIED
const flatVariantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // Now handles "250g", "500ml", "1kg", "Pack of 12", etc.
  mrp: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  images: [{ type: String }],
  countInStock: { type: Number, default: 0 },
  sku: { type: String },
  barcode: { type: String, unique: true, sparse: true }, // Optional unique barcode for each flat variant
  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number },
  variantStockThreshold: { type: Number, default: 5 },
});

const franchiseInventorySchema = new mongoose.Schema({
  franchiseId: { type: ObjectId, ref: "Franchise", required: true },

  // single product fields- store specific
  mrp: { type: Number, default: 0 },
  offerPrice: { type: Number, default: 0 }, // Store sets price directly

  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number },
  countInStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  outOfStock: { type: Boolean, default: false },

  // Variants (WeightPack/ColorSize only)
  flatVariants: [flatVariantSchema],
  colorVariants: [colorVariantSchema],
  isEnable: { type: Boolean, default: false },
  coupons: [
    {
      type: ObjectId,
      ref: "Coupon",
    },
  ],
});

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hasVariants: { type: Boolean, default: false },

    // Product type determines allowed variants
    productType: {
      type: String,
      enum: ["Single", "ColorSize", "WeightPack"],
      required: true,
    },

    //Product Level barcode and SKU (if no variants)
    sku: { type: String, unique: true, sparse: true },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return !this.hasVariants;
      },
    },

    // 🔹 Product-level color (if no variants)
    color: {
      name: { type: String },
      code: { type: String, default: "" },
    },

    // 🔹 Product-level size (if no variants) - Can be clothing size or weight/pack info
    size: { type: String },

    // clothing/footwear variants
    colorVariants: [colorVariantSchema],

    // weight/pack variants - SIMPLIFIED
    flatVariants: [flatVariantSchema],

    images: [{ type: String }],
    brand: { type: ObjectId, ref: "Brand" },
    category: { type: ObjectId, ref: "Category" },
    subCategory: { type: ObjectId, ref: "SubCategory" },
    segment: { type: ObjectId, ref: "Segment" },
    coupons: [{ type: ObjectId, ref: "Coupon" }],

    description: { type: String },
    aboutTheBrand: { type: String },
    specification: { type: String },
    tags: [{ type: String }],
    keywords: [{ type: String }],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    // Single product pricing (used if hasVariants = false)
    mrp: { type: Number, default: 0 },
    offerPrice: { type: Number, default: 0 },
    minOrderQuantity: { type: Number, default: 1 },
    maxOrderQuantity: { type: Number },
    countInStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number },
    outOfStock: { type: Boolean, default: false },

    isEnable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    // REMOVED: weight, weightUnit, unit fields - now handled by size field

    tax: { type: Number },
    // deliveryTime: {
    //   value: { type: Number, required: true },
    //   unit: { type: String, enum: ["minutes", "hours", "days"], default: "days" },
    // },

    returnable: { type: Boolean, default: true },
    returnWindow: { type: Number, default: 7 },
    warrantyPeriod: { type: String },

    visibility: {
      type: String,
      enum: ["Public", "Private", "Draft"],
      default: "Public",
    },

    attributes: [{ key: String, value: String }],
    createdBy: { type: ObjectId, ref: "User" },
    isAvailable: { type: Boolean, default: true },
    backupStock: {
      countInStock: { type: Number, default: 0 },
      flatVariants: { type: Array, default: [] },
      colorVariants: { type: Array, default: [] },
    },
    //new:multiStore
    franchiseInventories: [franchiseInventorySchema],
  },
  { timestamps: true },
);

// Auto set outOfStock flag & enforce only allowed variant type
productSchema.pre("save", function () {
  // ── Master product: enforce variant type ────────────────────────────────
  // Only clear master variants — never touch franchiseInventories
  if (this.productType === "ColorSize") {
    this.flatVariants = [];
  } else if (this.productType === "WeightPack") {
    this.colorVariants = [];
  } else if (this.productType === "Single") {
    this.colorVariants = [];
    this.flatVariants = [];
  }

  // ── Master product: outOfStock calc ─────────────────────────────────────
  if (
    this.hasVariants &&
    Array.isArray(this.colorVariants) &&
    this.colorVariants.length > 0
  ) {
    this.outOfStock = this.colorVariants.every((color) =>
      color.sizes.every((size) => (size.countInStock || 0) === 0),
    );
  } else if (
    this.hasVariants &&
    Array.isArray(this.flatVariants) &&
    this.flatVariants.length > 0
  ) {
    this.outOfStock = this.flatVariants.every(
      (v) => (v.countInStock || 0) === 0,
    );
  } else {
    this.outOfStock = (this.countInStock || 0) === 0;
  }

  // ── Franchise inventories: outOfStock calc per store ─────────────────────
  // ✅ ADDED — recalculate outOfStock for each franchise inventory entry
  if (Array.isArray(this.franchiseInventories)) {
    this.franchiseInventories.forEach((inv) => {
      if (this.productType === "Single") {
        inv.outOfStock = (inv.countInStock || 0) === 0;
      } else if (this.productType === "WeightPack") {
        inv.outOfStock =
          Array.isArray(inv.flatVariants) && inv.flatVariants.length > 0
            ? inv.flatVariants.every((v) => (v.countInStock || 0) === 0)
            : (inv.countInStock || 0) === 0;
      } else if (this.productType === "ColorSize") {
        inv.outOfStock =
          Array.isArray(inv.colorVariants) && inv.colorVariants.length > 0
            ? inv.colorVariants.every((cv) =>
                cv.sizes.every((s) => (s.countInStock || 0) === 0),
              )
            : (inv.countInStock || 0) === 0;
      }
    });
  }

  
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
