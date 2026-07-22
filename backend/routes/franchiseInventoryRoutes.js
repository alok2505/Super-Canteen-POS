// ============================================================
// franchiseInventoryRoutes.js — Franchise stock / batch management
// ============================================================
// These routes manage the physical inventory (batches) inside one franchise.
// Each batch = a delivery of products with quantity, expiry, and location.
//
// Role rules (from the permission matrix):
//   • View inventory    → INVENTORY_VIEW_ROLES
//       Admin monitors all franchises' inventory for business oversight.
//       StoreManager views and manages their own franchise's stock.
//       InventoryStaff can see stock levels at the counter (read-only).
//   • Receive a batch   → INVENTORY_WRITE_ROLES (Admin emergency + StoreManager)
//   • Update a batch    → INVENTORY_WRITE_ROLES
//   • Delete a batch    → INVENTORY_WRITE_ROLES
//
// Important: requireActiveFranchise is applied globally here so inactive
// franchises cannot perform ANY inventory operation regardless of role.
// Admin skips the franchise-active check (they operate cross-franchise).
// ============================================================

const router = require("express").Router();

const {
  authenticate,
  requireActiveFranchise,
  requireRole,
} = require("../middlewares/authMiddleware");

const {
  INVENTORY_VIEW_ROLES,
  INVENTORY_WRITE_ROLES,
} = require("../utils/roleConstants");

const {
  listMyInventory,
  receiveBatch,
  updateBatch,
  deleteBatch,
} = require("../controllers/franchiseInventoryController");

// Apply authentication + active-franchise check to ALL routes in this file.
// Admin bypasses requireActiveFranchise automatically (not franchise-scoped).
router.use(authenticate, requireActiveFranchise);

// GET /franchise-inventory
// Lists all inventory batches belonging to the caller's franchise.
// Admin: can view inventory across all franchises for business monitoring.
// StoreManager: views and manages their own franchise's stock.
// InventoryStaff: read-only access — needs stock info for POS (e.g. "is this in stock?").
router.get("/", requireRole(...INVENTORY_VIEW_ROLES), listMyInventory);

// POST /franchise-inventory
// Records a new delivery / received stock batch for this franchise.
// StoreManager receives inventory day-to-day.
// Admin can also receive inventory as an optional emergency override.
router.post("/", requireRole(...INVENTORY_WRITE_ROLES), receiveBatch);

// PATCH /franchise-inventory/:batchId
// Updates an existing batch (quantity correction, location change, expiry update, etc.).
// Only StoreManager (and Admin for emergencies) can modify stock records.
router.patch("/:batchId", requireRole(...INVENTORY_WRITE_ROLES), updateBatch);

// DELETE /franchise-inventory/:batchId
// Removes a batch record (expired stock, data correction, etc.).
// Only StoreManager (and Admin for emergencies) can delete inventory batches.
router.delete("/:batchId", requireRole(...INVENTORY_WRITE_ROLES), deleteBatch);

module.exports = router;
