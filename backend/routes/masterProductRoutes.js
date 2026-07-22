// ============================================================
// masterProductRoutes.js — Master product catalogue (Admin panel)
// ============================================================
// Master Products are the global product database created by Admin.
// They are the template that franchise-level products are based on.
//
// Role rules (from the permission matrix):
//   • View master products  → Any authenticated user (StoreManager needs
//                             this to browse the catalogue before adding to
//                             their franchise inventory)
//   • Create master product → Admin only
//   • Update master product → Admin only
//   • Delete master product → Admin only
// ============================================================

const router = require("express").Router();

const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const { ADMIN_ONLY } = require("../utils/roleConstants");

const {
  listMasterProducts,
  createMasterProduct,
  updateMasterProduct,
  deleteMasterProduct,
} = require("../controllers/masterProductController");

// Apply authentication to all routes in this file
router.use(authenticate);

// GET /master-products
// Returns the full master product catalogue.
// Available to all authenticated users — StoreManagers browse this
// when deciding which products to stock in their franchise.
router.get("/", listMasterProducts);

// POST /master-products
// Adds a new product to the global master catalogue.
// Only Admin can create master products.
router.post("/", requireRole(...ADMIN_ONLY), createMasterProduct);

// PATCH /master-products/:productId
// Updates a master product (price, name, barcode, category, etc.).
// Only Admin can edit the global catalogue.
router.patch("/:productId", requireRole(...ADMIN_ONLY), updateMasterProduct);

// DELETE /master-products/:productId
// Removes a product from the master catalogue.
// Only Admin can delete master products.
router.delete("/:productId", requireRole(...ADMIN_ONLY), deleteMasterProduct);

module.exports = router;
