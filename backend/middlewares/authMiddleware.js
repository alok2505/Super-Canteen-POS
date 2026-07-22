// ============================================================
// authMiddleware.js — JWT authentication + role / franchise guards
// ============================================================
// These middleware functions are chained on every protected route:
//   authenticate → requireRole(...) → requireActiveFranchise
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

// ------------------------------------------------------------
// authenticate
// ------------------------------------------------------------
// Reads the JWT from either:
//   • Authorization: Bearer <token>   header  (API / mobile clients)
//   • cookie named "jwt"              (browser clients)
// Verifies the token, loads the matching user from DB, and
// attaches it to req.user for downstream middleware & controllers.
// Returns 401 if the token is missing or has been tampered with.
// ------------------------------------------------------------
const authenticate = async (req, res, next) => {
  let token;

  // Check Authorization header first, then fall back to cookie
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      // Decode & verify the JWT; throws if expired or signature mismatch
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

      // Hydrate req.user from DB so we always have fresh role/franchiseId data
      // (never trust the role stored inside the token itself)
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ------------------------------------------------------------
// requireRole(...roles)
// ------------------------------------------------------------
// Factory that returns a middleware which checks req.user.role
// against the supplied allowed-roles list.
// Usage:  requireRole("Admin", "StoreManager")
//         requireRole(...BILLING_ROLES)           ← spread a constant array
// Returns 403 if the user's role is not in the list.
// Must be called AFTER authenticate so req.user is available.
// ------------------------------------------------------------
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Not authorized for this action` });
    }
  };
};

// ------------------------------------------------------------
// requireActiveFranchise
// ------------------------------------------------------------
// Only applies to franchise-scoped roles: StoreManager, InventoryStaff,
// PackingStaff. Admin is skipped because they operate across all franchises.
//
// Checks:
//   1. The user has a franchiseId assigned (every staff member must have one)
//   2. That franchise exists and its status is "Active"
//
// Returns 403 if the franchise is missing, not found, or inactive.
// This prevents staff from operating after a franchise is suspended.
// Must be called AFTER authenticate.
// ------------------------------------------------------------
const requireActiveFranchise = async (req, res, next) => {
  const franchiseRoles = ["StoreManager", "InventoryStaff", "PackingStaff"];

  // Admin and other roles skip this check — they are not franchise-scoped
  if (!franchiseRoles.includes(req.user?.role)) return next();

  if (!req.user.franchiseId) {
    return res
      .status(403)
      .json({ message: "No franchise is assigned to this account." });
  }

  const Franchise = require("../models/franchiseModel");
  const franchise = await Franchise.findById(req.user.franchiseId)
    .select("status")
    .lean();

  if (!franchise || franchise.status !== "Active") {
    return res.status(403).json({
      message:
        "This franchise is inactive. Stock changes, staff changes, and sales are disabled.",
    });
  }

  next();
};

module.exports = { authenticate, requireRole, requireActiveFranchise };
