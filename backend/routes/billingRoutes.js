const express= require("express");
const router= express.Router();
const { authenticate, requireActiveFranchise, requireRole } = require("../middlewares/authMiddleware");

const {
    previewBill,
} = require("../controllers/billingController");

// The billing preview must use the same franchise inventory as the scanner.
router.post("/preview", authenticate, requireActiveFranchise, requireRole("StoreManager"), previewBill);

module.exports = router;
