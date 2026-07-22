// ============================================================
// billRoutes.js — Saved / completed bill endpoints
// ============================================================
// These routes handle bills that have been finalised
// (payment collected, stock deducted, receipt printed).
//
// Role rules:
//   • Save a bill     → BILLING_ROLES (StoreManager, InventoryStaff)
//                       Admin does NOT create bills — billing is a franchise op.
//   • View bills      → BILLING_ROLES (staff reprint receipts, managers review)
//                       Admin views billing reports via the reports module, not here.
//   • Delete a bill   → MANAGER_ONLY (StoreManager)
//                       Staff cannot delete billing history.
//                       Admin does not participate in franchise-level billing.
//
// Note: requireActiveFranchise ensures the caller belongs to an active franchise.
// Admin bypasses this check (they are not franchise-scoped).
// ============================================================

const express = require("express");
const router = express.Router();

const {
  authenticate,
  requireActiveFranchise,
  requireRole,
} = require("../middlewares/authMiddleware");

const { BILLING_ROLES, MANAGER_ONLY } = require("../utils/roleConstants");

const {
  saveBill,
  getBills,
  getBillById,
  deleteBill,
} = require("../controllers/billController");

// POST /bills
// Saves a completed bill after payment is processed.
// StoreManager and InventoryStaff (cashiers) create bills every day.
// Admin is excluded — Admin manages business structure, not the counter.
router.post(
  "/",
  authenticate,
  requireActiveFranchise,
  requireRole(...BILLING_ROLES),
  saveBill
);

// GET /bills
// Returns the list of all bills for the caller's franchise.
// StoreManager reviews daily sales; Staff may reprint a missed receipt.
// Admin views cross-franchise billing data via the reports module.
router.get(
  "/",
  authenticate,
  requireActiveFranchise,
  requireRole(...BILLING_ROLES),
  getBills
);

// GET /bills/:id
// Returns a single bill's full details by its MongoDB ID.
// Used for reprinting receipts or reviewing a specific transaction.
router.get(
  "/:id",
  authenticate,
  requireActiveFranchise,
  requireRole(...BILLING_ROLES),
  getBillById
);

// DELETE /bills/:id
// Hard-deletes a bill record.
// Only StoreManager can delete bills — they are responsible for their franchise's
// audit trail. Staff cannot erase transactions; Admin does not touch franchise bills.
router.delete(
  "/:id",
  authenticate,
  requireActiveFranchise,
  requireRole(...MANAGER_ONLY),
  deleteBill
);

module.exports = router;
