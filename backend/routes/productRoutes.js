const express = require("express");
const router = express.Router();

const {
  addProduct,
  updateProductDetails,
  deleteProductById,
  fetchProducts,
  fetchProductById,
  fetchProductByIdByUser,
  fetchAllProducts,
  fetchAllProductsByAdmin,
  productSearch,
  scanProductByBarcode,
} = require("../controllers/productController");

// ==============================
// Product CRUD
// ==============================

// Create Product
router.post("/", addProduct);

// Update Product
router.put("/:id", updateProductDetails);

// Delete Product
router.delete("/:id", deleteProductById);

// ==============================
// Product Listing
// ==============================

// Fetch all products (Customer / Store)
router.get("/", fetchAllProducts);

// Fetch all products (Admin)
router.get("/admin", fetchAllProductsByAdmin);

// Pagination
router.get("/list", fetchProducts);

// ==============================
// Search
// ==============================

// Search by name / sku / barcode
router.get("/search", productSearch);

// Scan barcode (POS)
router.get("/scan/:barcode", scanProductByBarcode);

// ==============================
// Product Details
// ==============================

// User Product Details
router.get("/user/:id", fetchProductByIdByUser);

// Admin Product Details
router.get("/:id", fetchProductById);

module.exports = router;