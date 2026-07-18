const express= require("express");
const router= express.Router();
const { authenticate } = require("../middlewares/authMiddleware");

const {
    previewBill,
} = require("../controllers/billingController");

// The billing preview must use the same franchise inventory as the scanner.
router.post("/preview", authenticate, previewBill);

module.exports = router;
