const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String, // Optional, for manual entry e.g., WELCOME100
      unique: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: [
        "Flat Discount",
        "Percentage Discount",
        "Free Product",
        "Buy X Get Y",
        "Combo Offer",
        "Bill Value Discount",
        "Category Offer",
        "Product Offer",
      ],
      required: true,
    },
    conditions: {
      minBillAmount: { type: Number, default: 0 },
      minQuantity: { type: Number, default: 0 },
      applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      applicableCategories: [{ type: String }],
      customerType: {
        type: String,
        enum: ["All", "Frequent", "New"],
        default: "All",
      },
    },
    benefits: {
      discountValue: { type: Number, default: 0 }, // Rs. OFF or % OFF depending on type
      maxDiscount: { type: Number, default: 0 }, // For percentage discounts
      freeProduct: {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 0 },
      },
    },
    validity: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableFranchises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Franchise",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
