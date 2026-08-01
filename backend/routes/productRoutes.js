
// ============================================================
// productRoutes.js — Product catalogue & POS scan/search endpoints
// ============================================================
// Products are the master catalogue managed by Admin.
// Franchise-level stock is managed via franchiseInventoryRoutes.
//
// Role rules (from the permission matrix):
//   • Create product        → Admin only
//   • Update product        → Admin only
//   • Delete product        → Admin only
//   • Update stock/location → INVENTORY_WRITE_ROLES (Admin, StoreManager)
//   • Search products       → ALL_ROLES (Admin browses catalogue,
//                             StoreManager/Staff search at the counter)
//   • Scan barcode (POS)    → BILLING_ROLES only (StoreManager, InventoryStaff)
//                             Admin does NOT scan barcodes — Admin is not a cashier.
//   • List / view products  → Any authenticated user
// ============================================================

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  authenticate,
  requireActiveFranchise,
  requireRole,
} = require("../middlewares/authMiddleware");

const {
  BILLING_ROLES,
  INVENTORY_WRITE_ROLES,
  ADMIN_ONLY,
  ALL_ROLES,
} = require("../utils/roleConstants");

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

// ---------------------------------------------------------------
// Product CRUD — Admin only
// ---------------------------------------------------------------

// POST /products
// Creates a new master product in the catalogue.
// Only Admin manages the master product catalogue.
router.post("/", authenticate, requireRole(...ADMIN_ONLY), upload.array("images", 5), addProduct);

// PUT /products/:id
// Updates a master product's details (name, price, barcode, category, etc.).
// Only Admin can modify master product data.
router.put("/:id", authenticate, requireRole(...ADMIN_ONLY), upload.array("images", 5), updateProductDetails);

// DELETE /products/:id
// Permanently deletes a product from the master catalogue.
// Only Admin can remove master products.
router.delete("/:id", authenticate, requireRole(...ADMIN_ONLY), deleteProductById);

// ---------------------------------------------------------------
// Stock & Location update — Inventory write roles
// ---------------------------------------------------------------

// PUT /products/:productId/stock
// Updates the stock count and/or physical location of a product
// within the caller's franchise inventory.
// StoreManager is the primary operator; Admin can do this as an emergency override.
// InventoryStaff are READ-ONLY for stock — they cannot change stock counts.
router.put(
  "/:productId/stock",
  authenticate,
  requireActiveFranchise,
  requireRole(...INVENTORY_WRITE_ROLES),
  updateStockCount
);

// ---------------------------------------------------------------
// Product Listing — Any authenticated user
// ---------------------------------------------------------------

// GET /products
// Returns the full product list visible to a store/customer.
// Any logged-in user can view the catalogue.
router.get("/", authenticate, fetchAllProducts);

// GET /products/admin
// Returns the full product list in Admin format (with extra metadata).
// Used by the Admin dashboard directly.
router.get("/admin", fetchAllProductsByAdmin);

// GET /products/list
// Paginated product list used by catalogue pages.
router.get("/list", fetchProducts);

// ---------------------------------------------------------------
// Search — All three roles
// ---------------------------------------------------------------

// GET /products/search?q=...
// Full-text product search by name, SKU, or barcode.
// Admin: searches the master catalogue when managing products.
// StoreManager + InventoryStaff: search at the counter to find items quickly.
router.get("/search", authenticate, requireRole(...ALL_ROLES), productSearch);

// ---------------------------------------------------------------
// Scan Barcode — Billing roles only (POS operation)
// ---------------------------------------------------------------

// GET /products/scan/:barcode
// Looks up a product by its barcode — the core POS scan action.
// Only StoreManager and InventoryStaff (cashiers) scan barcodes.
// Admin is NOT a cashier and cannot scan — use the search endpoint for catalogue lookup.
router.get(
  "/scan/:barcode",
  authenticate,
  requireRole(...BILLING_ROLES),
  scanProductByBarcode
);

// ---------------------------------------------------------------
// Individual product detail views
// ---------------------------------------------------------------

// GET /products/user/:id
// Customer-facing product detail (price, description, images). No auth required.
router.get("/user/:id", fetchProductByIdByUser);

// GET /products/:id
// Admin / internal product detail with full metadata.
router.get("/:id", fetchProductById);

module.exports = router;
