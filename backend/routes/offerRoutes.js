const express = require("express");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const { ADMIN, STORE_MANAGER } = require("../utils/roleConstants");
const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} = require("../controllers/offerController");

const router = express.Router();

// Publicly available to authenticated users (e.g., POS needs to fetch active offers)
router.get("/", authenticate, getOffers);
router.get("/:id", authenticate, getOfferById);

// Admin / StoreManager only to manage offers
router.post("/", authenticate, requireRole([ADMIN, STORE_MANAGER]), createOffer);
router.put("/:id", authenticate, requireRole([ADMIN, STORE_MANAGER]), updateOffer);
router.delete("/:id", authenticate, requireRole([ADMIN, STORE_MANAGER]), deleteOffer);

module.exports = router;
