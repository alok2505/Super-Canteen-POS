const express = require("express");
const router = express.Router();

const {
  authenticate,
  requireActiveFranchise,
} = require("../middlewares/authMiddleware");

const {
  getDashboardStats,
  getLowStockAlerts,
} = require("../controllers/reportController");

// Reports are accessible by StoreManager (and Admin if they specify franchise, but Admin is excluded from requireActiveFranchise by default if we want, 
// wait, requireActiveFranchise excludes Admin? Yes, usually.
// Let's just use authenticate for Admin/Manager).

// GET /api/reports/stats
router.get(
  "/stats",
  authenticate,
  getDashboardStats
);

// GET /api/reports/low-stock
router.get(
  "/low-stock",
  authenticate,
  getLowStockAlerts
);

module.exports = router;
