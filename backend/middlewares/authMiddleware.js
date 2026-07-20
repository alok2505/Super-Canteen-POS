const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const authenticate = async (req, res, next) => {
  let token;

  // Check headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Not authorized for this action` });
    }
  };
};

const requireActiveFranchise = async (req, res, next) => {
  const franchiseRoles = ["StoreManager", "InventoryStaff", "PackingStaff"];
  if (!franchiseRoles.includes(req.user?.role)) return next();

  if (!req.user.franchiseId) {
    return res.status(403).json({ message: "No franchise is assigned to this account." });
  }

  const Franchise = require("../models/franchiseModel");
  const franchise = await Franchise.findById(req.user.franchiseId).select("status").lean();
  if (!franchise || franchise.status !== "Active") {
    return res.status(403).json({ message: "This franchise is inactive. Stock changes, staff changes, and sales are disabled." });
  }
  next();
};

module.exports = { authenticate, requireRole, requireActiveFranchise };
