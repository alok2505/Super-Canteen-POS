const router = require("express").Router();
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const { listMasterProducts, createMasterProduct, updateMasterProduct, deleteMasterProduct } = require("../controllers/masterProductController");
router.use(authenticate);
router.get("/", listMasterProducts);
router.post("/", requireRole("Admin"), createMasterProduct);
router.patch("/:productId", requireRole("Admin"), updateMasterProduct);
router.delete("/:productId", requireRole("Admin"), deleteMasterProduct);
module.exports = router;
