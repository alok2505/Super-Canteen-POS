// ============================================================
// holdBillRoutes.js — Hold Bill (paused order) endpoints
// ============================================================
// Hold bills are orders paused mid-billing — e.g. a customer went to
// get cash and will return shortly. Stored separately until resumed.
//
// Role rules:
//   • Save / view / resume hold bills → BILLING_ROLES (StoreManager, InventoryStaff)
//     Both managers and staff do counter work and need to hold/resume orders.
//   • Delete a hold bill              → MANAGER_ONLY (StoreManager)
//     Staff should not permanently discard a customer's paused order.
//     Admin does not operate the POS and cannot interact with hold bills.
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
  saveHoldBill,
  getHoldBills,
  getHoldBillById,
  deleteHoldBill,
} = require("../controllers/holdBillController");

// POST /hold-bills
// Saves the current cart as a "hold" so the cashier can serve another customer.
// StoreManager and InventoryStaff both do counter work and need this feature.
// Admin cannot hold bills — Admin does not operate the counter.
router.post(
  "/",
  authenticate,
  requireActiveFranchise,
  requireRole(...BILLING_ROLES),
  saveHoldBill
);

// GET /hold-bills
// Returns all current hold bills for the caller's franchise.
// Staff need to see what's on hold to resume a specific customer's order.
router.get(
  "/",
  authenticate,
  requireActiveFranchise,
  requireRole(...BILLING_ROLES),
  getHoldBills
);

// GET /hold-bills/:id
// Returns a single hold bill by ID — used when resuming an order into the POS.
router.get(
  "/:id",
  authenticate,
  requireActiveFranchise,
  requireRole(...BILLING_ROLES),
  getHoldBillById
);

// DELETE /hold-bills/:id
// Permanently removes a hold bill (e.g. customer never returned).
// Only StoreManager can discard a hold bill — they manage the franchise's data.
// Staff cannot delete hold records; Admin is not involved in franchise billing.
router.delete(
  "/:id",
  authenticate,
  requireActiveFranchise,
  requireRole(...MANAGER_ONLY),
  deleteHoldBill
);

module.exports = router;
