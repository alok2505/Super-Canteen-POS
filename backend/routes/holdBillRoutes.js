const express = require("express");
const router = express.Router();
const { authenticate, requireActiveFranchise, requireRole } = require("../middlewares/authMiddleware");

const {
    saveHoldBill,
    getHoldBills,
    getHoldBillById,
    deleteHoldBill,
} = require("../controllers/holdBillController");

router.post("/", authenticate, requireActiveFranchise, requireRole("StoreManager"), saveHoldBill);

router.get("/", authenticate, requireActiveFranchise, getHoldBills);

router.get("/:id", authenticate, requireActiveFranchise, getHoldBillById);

router.delete("/:id", authenticate, requireActiveFranchise, deleteHoldBill);

module.exports = router;
