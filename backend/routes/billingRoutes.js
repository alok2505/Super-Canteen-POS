const express= require("express");
const router= express.Router();

const {
    previewBill,
} = require("../controllers/billingController");

router.post("/preview", previewBill);

module.exports = router;