const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const {
  getCustomers,
  getCustomerById,
  createOrUpdateCustomer,
} = require("../controllers/customerController");

const router = express.Router();

// Routes for Customer Management
router.get("/", authenticate, getCustomers);
router.get("/:id", authenticate, getCustomerById);
router.post("/", authenticate, createOrUpdateCustomer);

module.exports = router;
