const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const { searchBill, processReturn, getReturnById, getReturnsByBillId, getReturns } = require("../controllers/returnController");

const router = express.Router();

router.post("/search-bill", authenticate, searchBill);
router.post("/process", authenticate, processReturn);
router.get("/", authenticate, getReturns);
router.get("/:id", authenticate, getReturnById);
router.get("/bill/:billId", authenticate, getReturnsByBillId);

module.exports = router;
