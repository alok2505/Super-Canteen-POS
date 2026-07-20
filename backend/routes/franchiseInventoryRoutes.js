const router = require("express").Router();
const { authenticate, requireActiveFranchise, requireRole } = require("../middlewares/authMiddleware");
const { listMyInventory, receiveBatch, updateBatch, deleteBatch } = require("../controllers/franchiseInventoryController");
router.use(authenticate, requireActiveFranchise, requireRole("StoreManager"));
router.get("/", listMyInventory);
router.post("/", receiveBatch);
router.patch("/:batchId", updateBatch);
router.delete("/:batchId", deleteBatch);
module.exports = router;
