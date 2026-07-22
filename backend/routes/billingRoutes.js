// ============================================================
// billingRoutes.js — Live POS preview endpoint
// ============================================================
// Called in real-time from the POS screen every time the cart changes.
// Calculates the current bill total (taxes, discounts, net amount) WITHOUT
// saving anything to the database — pure calculation only.
//
// Role rules:
//   • BILLING_ROLES only — StoreManager + InventoryStaff
//   • Admin is intentionally excluded:
//       Admin manages the business structure (franchises, products, users).
//       Billing is a franchise operation handled by managers and staff.
//       If Admin needs to access a POS for testing, use "Act as Franchise".
// ============================================================

const express = require("express");
const router = express.Router();

const {
  authenticate,
  requireActiveFranchise,
  requireRole,
} = require("../middlewares/authMiddleware");

const { BILLING_ROLES } = require("../utils/roleConstants");

const { previewBill } = require("../controllers/billingController");

// POST /billing/preview
// Calculates an in-memory bill from the cart items sent in the request body.
// Used by the POS screen to show live totals while the cashier adds products.
// Does NOT deduct stock or save any record.
// StoreManager and InventoryStaff (cashiers) call this on every cart change.
// Admin cannot call this — Admin does not operate the counter.
router.post(
  "/preview",
  authenticate,
  requireActiveFranchise,
  requireRole(...BILLING_ROLES),
  previewBill
);

module.exports = router;
