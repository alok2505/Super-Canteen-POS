const express = require("express");
const router = express.Router();
const { authenticate, requireActiveFranchise, requireRole } = require("../middlewares/authMiddleware");

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
  updateStockCount,
} = require("../controllers/productController");

// ==============================
// Product CRUD
// ==============================

// Create Product
router.post("/", authenticate, requireRole("Admin"), addProduct);

// Update Product
router.put("/:id", authenticate, requireRole("Admin"), updateProductDetails);

// Delete Product
router.delete("/:id", authenticate, requireRole("Admin"), deleteProductById);

// Update Stock & Location
router.put("/:productId/stock", authenticate, requireActiveFranchise, requireRole("StoreManager", "InventoryStaff"), updateStockCount);

// ==============================
// Product Listing
// ==============================

// Fetch all products (Customer / Store)
router.get("/", authenticate, fetchAllProducts);

// Fetch all products (Admin)
router.get("/admin", fetchAllProductsByAdmin);

// Pagination
router.get("/list", fetchProducts);

// ==============================
// Search
// ==============================

// Search by name / sku / barcode
router.get("/search", authenticate, productSearch);

// Scan barcode (POS)
router.get("/scan/:barcode", authenticate, scanProductByBarcode);

// ==============================
// Product Details
// ==============================

// User Product Details
router.get("/user/:id", fetchProductByIdByUser);

// Admin Product Details
router.get("/:id", fetchProductById);

module.exports = router;
