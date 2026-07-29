const asyncHandler = require("../middlewares/asyncHandler");
const Customer = require("../models/customerModel");
const Bill = require("../models/billModel");

// ==========================================
// Get All Customers
// GET /api/customers
// ==========================================
const getCustomers = asyncHandler(async (req, res) => {
  const franchiseId = req.user?.franchiseId;
  const { search, filter } = req.query;

  let query = {};

  // Support multi-tenant isolation if needed (optional: some systems share customers across franchises)
  // if (req.user?.role !== "Admin" && franchiseId) {
  //   query.franchiseId = franchiseId;
  // }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { contactNo: { $regex: search, $options: "i" } },
    ];
  }

  if (filter === "frequent") {
    query.isFrequent = true;
  } else if (filter === "new") {
    // Customers created in the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    query.createdAt = { $gte: lastWeek };
  } else if (filter === "inactive") {
    query.status = "Inactive";
  }

  const customers = await Customer.find(query).sort({ lastVisit: -1, createdAt: -1 });
  res.json({ success: true, count: customers.length, customers });
});

// ==========================================
// Get Customer By ID (with bills)
// GET /api/customers/:id
// ==========================================
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found." });
  }

  // Fetch their purchase history
  const bills = await Bill.find({ customerId: customer._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    customer,
    purchaseHistory: bills,
  });
});

// ==========================================
// Create or Update Customer (During POS)
// POST /api/customers
// ==========================================
const createOrUpdateCustomer = asyncHandler(async (req, res) => {
  const { contactNo, username, email, address, dob, anniversary } = req.body;
  const franchiseId = req.user?.franchiseId;

  if (!contactNo) {
    return res.status(400).json({ success: false, message: "Mobile number is required." });
  }

  let customer = await Customer.findOne({ contactNo });

  if (customer) {
    // Update optional fields if provided
    let updated = false;
    if (username && customer.username !== username) { customer.username = username; updated = true; }
    if (email && customer.email !== email) { customer.email = email; updated = true; }
    if (dob) { customer.dob = dob; updated = true; }
    if (anniversary) { customer.anniversary = anniversary; updated = true; }
    
    // Address logic
    if (address && customer.addresses) {
      if (customer.addresses.length === 0 || customer.addresses[0].address !== address) {
        customer.addresses[0] = { address, isDefault: true };
        updated = true;
      }
    }

    if (updated) {
      await customer.save();
    }
  } else {
    // Create new customer
    customer = await Customer.create({
      username: username || "Customer",
      contactNo,
      email: email || null,
      franchiseId: req.user?.role !== "Admin" ? franchiseId : null,
      createdBy: req.user._id,
      dob: dob || null,
      anniversary: anniversary || null,
      addresses: address ? [{ address, isDefault: true }] : [],
    });
  }

  res.json({ success: true, customer });
});

module.exports = {
  getCustomers,
  getCustomerById,
  createOrUpdateCustomer,
};
