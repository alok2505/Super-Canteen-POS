const express = require("express");
const router = express.Router();

const {
    saveHoldBill,
    getHoldBills,
    getHoldBillById,
    deleteHoldBill,
} = require("../controllers/holdBillController");

router.post("/", saveHoldBill);

router.get("/", getHoldBills);

router.get("/:id", getHoldBillById);

router.delete("/:id", deleteHoldBill);

module.exports = router;