const express = require("express");

const router = express.Router();

const {
  saveBill,
  getBills,
  getBillById,
  deleteBill,
} = require("../controllers/billController");

router.post("/", saveBill);

router.get("/", getBills);

router.get("/:id", getBillById);

router.delete("/:id", deleteBill);

module.exports = router;