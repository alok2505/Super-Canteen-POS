// ============================================================
// franchiseRoutes.js — Franchise CRUD & listing
// ============================================================
// A "Franchise" is a store location (branch). Admin creates and manages
// franchises, then assigns StoreManagers and Staff to them.
//
// Role rules (from the permission matrix):
//   • View active franchises (dropdown)  → Any authenticated user
//   • Create / List all / Edit / Delete  → Admin only
//   • Toggle franchise status            → Admin only
//
// Note: StoreManager can see their OWN franchise details via the
// profile endpoint — not via these routes. These routes are for
// the Admin panel to manage all franchises system-wide.
// ============================================================

const express = require("express");
const router = express.Router();

const {
  createFranchise,
  getFranchises,
  getFranchiseById,
  updateFranchise,
  deleteFranchise,
  getActiveFranchises,
  toggleFranchiseStatus,
} = require("../controllers/franchiseController.js");

const {
  authenticate,
  requireRole,
} = require("../middlewares/authMiddleware.js");

const { ADMIN_ONLY } = require("../utils/roleConstants");

// Apply authentication to every route in this file
router.use(authenticate);

// GET /franchises/active
// Returns a lightweight list of all ACTIVE franchises.
// Used in dropdown selectors (e.g. when Admin assigns a StoreManager).
// Any authenticated user can fetch this — no role guard needed.
router.get("/active", getActiveFranchises);

// All routes below this point require Admin role
// Admin is the only role that can see ALL franchises and modify them.
router.use(requireRole(...ADMIN_ONLY));

// POST /franchises     — Create a new franchise (Admin only)
// GET  /franchises     — List all franchises across the system (Admin only)
router.route("/")
  .post(createFranchise)
  .get(getFranchises);

// GET    /franchises/:franchiseId  — Get a single franchise's full details
// PATCH  /franchises/:franchiseId  — Update franchise info (name, address, etc.)
// DELETE /franchises/:franchiseId  — Permanently delete a franchise
router.route("/:franchiseId")
  .get(getFranchiseById)
  .patch(updateFranchise)
  .delete(deleteFranchise);

// PATCH /franchises/:franchiseId/toggle-status
// Activates or deactivates a franchise. When a franchise is set to Inactive,
// requireActiveFranchise blocks all staff operations for that branch.
router.patch("/:franchiseId/toggle-status", toggleFranchiseStatus);

module.exports = router;
