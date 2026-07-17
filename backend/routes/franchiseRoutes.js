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

const { authenticate, requireRole } = require("../middlewares/authMiddleware.js");

// All franchise operations typically require authentication
router.use(authenticate);

// Public/Shared active franchises (for dropdowns)
router.get("/active", getActiveFranchises);

// Admin only routes for CRUD
router.use(requireRole("Admin"));

router.route("/")
  .post(createFranchise)
  .get(getFranchises);

router.route("/:franchiseId")
  .get(getFranchiseById)
  .patch(updateFranchise)
  .delete(deleteFranchise);

router.patch("/:franchiseId/toggle-status", toggleFranchiseStatus);

module.exports = router;
