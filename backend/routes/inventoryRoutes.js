const router = require("express").Router();

const {
  authenticate,
  requireActiveFranchise,
  requireRole,
} = require("../middlewares/authMiddleware");

const {
  INVENTORY_VIEW_ROLES,
} = require("../utils/roleConstants");

const {
  getLocationInventory,
  getAggregatedStock
} = require("../controllers/inventoryController");

// Apply authentication + active-franchise check to ALL routes in this file.
// Admin bypasses requireActiveFranchise automatically.
router.use(authenticate, requireActiveFranchise);

// GET /api/inventory/location
// Allows searching and filtering batches by location and product details
router.get("/location", requireRole(...INVENTORY_VIEW_ROLES), getLocationInventory);

// GET /api/inventory/stock
// Aggregated view of inventory total stock by product
router.get("/stock", requireRole(...INVENTORY_VIEW_ROLES), getAggregatedStock);

module.exports = router;
