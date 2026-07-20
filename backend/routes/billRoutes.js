const express = require("express");

const router = express.Router();
const { authenticate, requireActiveFranchise, requireRole } = require("../middlewares/authMiddleware");

const {
  saveBill,
  getBills,
  getBillById,
  deleteBill,
} = require("../controllers/billController");

router.post("/", authenticate, requireActiveFranchise, requireRole("StoreManager"), saveBill);

router.get("/", authenticate, requireActiveFranchise, getBills);

router.get("/:id", authenticate, requireActiveFranchise, getBillById);

router.delete("/:id", authenticate, requireActiveFranchise, deleteBill);

module.exports = router;
