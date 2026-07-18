var asyncHandler = require("../middlewares/asyncHandler.js");
var Franchise    = require('../models/franchiseModel.js');
var User         = require('../models/userModel');
var Product      = require('../models/productModel');

const inventoryFromProduct = (product, franchiseId) => ({
  franchiseId,
  mrp: product.mrp || 0,
  offerPrice: product.offerPrice || 0,
  minOrderQuantity: product.minOrderQuantity || 1,
  maxOrderQuantity: product.maxOrderQuantity,
  countInStock: 0,
  lowStockThreshold: product.lowStockThreshold || 10,
  outOfStock: true,
  isEnable: false,
  // Each franchise starts at zero and receives its own independent variant stock.
  flatVariants: (product.flatVariants || []).map((variant) => ({ ...variant.toObject(), countInStock: 0 })),
  colorVariants: (product.colorVariants || []).map((color) => ({
    ...color.toObject(),
    sizes: color.sizes.map((size) => ({ ...size.toObject(), countInStock: 0 })),
  })),
});

// ─── Create Franchise ────────────────────────────────────────────────────────
var createFranchise = asyncHandler(async (req, res) => {
  var {
    name,
    address,
    contactNo,
    manager,
    status,
    servicePincodes,
    deliveryRadiusKm,
  } = req.body;

  if (
    !name ||
    !address?.address ||
    !address?.city ||
    !address?.state ||
    !address?.postalCode ||
    !address.currentLocation?.lat ||
    !address.currentLocation?.lng ||
    !contactNo ||
    !manager
  ) {
    res.status(400);
    throw new Error('Name, complete address (with lat/lng), contact number, and manager are required');
  }

  var managerUser = await User.findById(manager);
  if (!managerUser) {
    res.status(400);
    throw new Error('Invalid manager — user not found');
  }
  if (managerUser.role !== "StoreManager") {
    res.status(400);
    throw new Error('Manager must be a StoreManager');
  }
  if (managerUser.franchiseId) {
    res.status(400);
    throw new Error(`StoreManager "${managerUser.username}" is already assigned to another franchise`);
  }

  var digitsOnly = contactNo.replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    res.status(400);
    throw new Error('Contact number must be exactly 10 digits');
  }

  const lat = address.currentLocation.lat;
  const lng = address.currentLocation.lng;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400);
    throw new Error('Invalid latitude/longitude coordinates');
  }

  if (servicePincodes !== undefined) {
    if (!Array.isArray(servicePincodes)) {
      res.status(400);
      throw new Error('servicePincodes must be an array of strings');
    }
    const invalid = servicePincodes.some(p => typeof p !== 'string' || !/^\d{6}$/.test(p));
    if (invalid) {
      res.status(400);
      throw new Error('Each pincode must be a 6-digit string');
    }
    if (servicePincodes.length > 0) {
      const conflict = await Franchise.findOne({ servicePincodes: { $in: servicePincodes } });
      if (conflict) {
        res.status(400);
        throw new Error(`One or more pincodes already assigned to: ${conflict.name} (${conflict.code})`);
      }
    }
  }

  if (deliveryRadiusKm !== undefined && (typeof deliveryRadiusKm !== 'number' || deliveryRadiusKm <= 0)) {
    res.status(400);
    throw new Error('deliveryRadiusKm must be a positive number');
  }

  var franchise = await Franchise.create({
    name:             name.trim(),
    address,
    contactNo:        digitsOnly,
    manager:          managerUser._id,
    status:           status || 'Active',
    servicePincodes:  servicePincodes  || [],
    deliveryRadiusKm: deliveryRadiusKm || 10,
  });

  managerUser.franchiseId = franchise._id;
  await managerUser.save();

  // Give the new franchise an independent, disabled inventory record for every
  // existing catalog product. Stock is entered later from Products.
  const products = await Product.find({}).select(
    "mrp offerPrice minOrderQuantity maxOrderQuantity countInStock lowStockThreshold flatVariants colorVariants",
  );
  if (products.length) {
    await Product.bulkWrite(products.map((product) => ({
      updateOne: {
        filter: { _id: product._id, "franchiseInventories.franchiseId": { $ne: franchise._id } },
        update: { $push: { franchiseInventories: inventoryFromProduct(product, franchise._id) } },
      },
    })));
  }

  res.status(201).json({
    success: true,
    message: 'Franchise created successfully',
    franchise,
  });
});

// ─── Get All Franchises ──────────────────────────────────────────────────────
var getFranchises = asyncHandler(async (req, res) => {
  var page   = parseInt(req.query.page)  || 1;
  var limit  = parseInt(req.query.limit) || 10;
  var search = req.query.search?.trim()  || '';
  var status = req.query.status          || ''; // ✅ status filter

  var query = {};

  if (search) {
    // ✅ FIXED — removed manager $regex (ObjectId can't be regex searched)
    // ✅ ADDED  — state, contactNo, servicePincodes
    query.$or = [
      { name:               { $regex: search, $options: 'i' } },
      { code:               { $regex: search, $options: 'i' } },
      { 'address.city':     { $regex: search, $options: 'i' } },
      { 'address.state':    { $regex: search, $options: 'i' } },
      { contactNo:          { $regex: search, $options: 'i' } },
      { servicePincodes:    { $regex: search, $options: 'i' } },
    ];
  }

  if (status && ['Active', 'Inactive'].includes(status)) {
    query.status = status;
  }

  const [franchises, total] = await Promise.all([
    Franchise.find(query)
      .populate('manager', 'username email contactNo role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Franchise.countDocuments(query),
  ]);

  res.json({
    success: true,
    franchises,
    pagination: {
      currentPage: page,
      totalPages:  Math.ceil(total / limit),
      total,
      limit,
    },
  });
});

// ─── Get Franchise By ID ─────────────────────────────────────────────────────
var getFranchiseById = asyncHandler(async (req, res) => {
  var franchise = await Franchise.findById(req.params.franchiseId || req.params.id)
    .populate('manager', 'username email contactNo role');

  if (!franchise) {
    res.status(404);
    throw new Error('Franchise not found');
  }

  // ✅ ADDED — also return staff count for this franchise
  const staffCount = await User.countDocuments({
    franchiseId: franchise._id,
    role: { $in: ['StoreManager', 'InventoryStaff', 'PackingStaff'] },
  });

  res.json({
    success: true,
    franchise,
    staffCount, // useful for admin dashboard
  });
});

// ─── Update Franchise ────────────────────────────────────────────────────────
var updateFranchise = asyncHandler(async (req, res) => {
  var {
    name,
    address,
    contactNo,
    manager,
    status,
    servicePincodes,  // ✅ ADDED
    deliveryRadiusKm, // ✅ ADDED
  } = req.body;

  var franchise = await Franchise.findById(req.params.franchiseId);
  if (!franchise) {
    res.status(404);
    throw new Error('Franchise not found');
  }

  // ✅ Ensure current manager has franchiseId
  var currentManagerUser = await User.findById(franchise.manager);
  if (currentManagerUser && !currentManagerUser.franchiseId) {
    currentManagerUser.franchiseId = franchise._id;
    await currentManagerUser.save();
  }

  // ✅ Manager change
  if (manager && manager !== franchise.manager.toString()) {
    var newManagerUser = await User.findById(manager);
    if (!newManagerUser) {
      res.status(400);
      throw new Error('Invalid new manager — user not found');
    }
    if (newManagerUser.role !== "StoreManager") {
      res.status(400);
      throw new Error('New manager must be a StoreManager');
    }
    if (newManagerUser.franchiseId && newManagerUser.franchiseId.toString() !== franchise._id.toString()) {
      res.status(400);
      throw new Error(`This StoreManager is already assigned to another franchise`);
    }
    // Unlink old manager
    if (currentManagerUser) {
      currentManagerUser.franchiseId = null;
      await currentManagerUser.save();
    }
    // Link new manager
    newManagerUser.franchiseId = franchise._id;
    await newManagerUser.save();
  }

  // ✅ Address + geo validation
  if (address) {
    if (!address.address || !address.city || !address.state || !address.postalCode) {
      res.status(400);
      throw new Error('Complete address fields are required');
    }
    if (!address.currentLocation?.lat || !address.currentLocation?.lng) {
      res.status(400);
      throw new Error('Geolocation (lat/lng) is required when updating address');
    }
    const lat = address.currentLocation.lat;
    const lng = address.currentLocation.lng;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400);
      throw new Error('Invalid latitude/longitude coordinates');
    }
  }

  // ✅ Contact number validation
  if (contactNo) {
    var digitsOnly = contactNo.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      res.status(400);
      throw new Error('Contact number must be 10 digits');
    }
    contactNo = digitsOnly;
  }

  // ✅ ADDED — servicePincodes validation on update
  if (servicePincodes !== undefined) {
    if (!Array.isArray(servicePincodes)) {
      res.status(400);
      throw new Error('servicePincodes must be an array of strings');
    }
    const invalid = servicePincodes.some(p => typeof p !== 'string' || !/^\d{6}$/.test(p));
    if (invalid) {
      res.status(400);
      throw new Error('Each pincode must be a 6-digit string');
    }
    if (servicePincodes.length > 0) {
      // ✅ exclude self from conflict check
      const conflict = await Franchise.findOne({
        servicePincodes: { $in: servicePincodes },
        _id: { $ne: franchise._id },
      });
      if (conflict) {
        res.status(400);
        throw new Error(`One or more pincodes already assigned to: ${conflict.name} (${conflict.code})`);
      }
    }
  }

  // ✅ ADDED — deliveryRadiusKm validation on update
  if (deliveryRadiusKm !== undefined && (typeof deliveryRadiusKm !== 'number' || deliveryRadiusKm <= 0)) {
    res.status(400);
    throw new Error('deliveryRadiusKm must be a positive number');
  }

  var updatedFranchise = await Franchise.findByIdAndUpdate(
    req.params.franchiseId,
    {
      ...(name             && { name: name.trim() }),
      ...(address          && { address }),
      ...(contactNo        && { contactNo }),
      ...(manager          && { manager }),
      ...(status           && { status }),
      ...(servicePincodes  !== undefined && { servicePincodes }),  // ✅ ADDED
      ...(deliveryRadiusKm !== undefined && { deliveryRadiusKm }), // ✅ ADDED
    },
    { new: true, runValidators: true }
  ).populate('manager', 'username email contactNo role');

  res.json({
    success: true,
    message: 'Franchise updated successfully',
    franchise: updatedFranchise,
  });
});

// ─── Delete Franchise ────────────────────────────────────────────────────────
var deleteFranchise = asyncHandler(async (req, res) => {
  var franchise = await Franchise.findById(req.params.franchiseId);
  if (!franchise) {
    res.status(404);
    throw new Error('Franchise not found');
  }

  // ✅ FIXED — check ALL staff roles, not just StoreManager
  const assignedStaff = await User.countDocuments({
    franchiseId: req.params.franchiseId,
    role: { $in: ['StoreManager', 'InventoryStaff', 'PackingStaff'] },
  });

  if (assignedStaff > 0) {
    res.status(400);
    throw new Error(`Cannot delete franchise — ${assignedStaff} staff member(s) still assigned. Reassign or deactivate them first.`);
  }

  await Franchise.findByIdAndDelete(req.params.franchiseId);

  res.json({
    success: true,
    message: 'Franchise deleted successfully',
  });
});

// ─── Get Active Franchises (dropdown use) ───────────────────────────────────
var getActiveFranchises = asyncHandler(async (req, res) => {
  var franchises = await Franchise.find({ status: 'Active' })
    .populate('manager', 'username')
    // ✅ FIXED — removed shopName (doesn't exist on Franchise model)
    .select('name code address.city address.state servicePincodes deliveryRadiusKm manager')
    .sort({ name: 1 })
    .lean();

  res.json({
    success: true,
    franchises: franchises.map(f => ({
      ...f,
      managerName: f.manager?.username || 'No Manager Assigned',
    })),
  });
});

// ─── Toggle Franchise Status ─────────────────────────────────────────────────
var toggleFranchiseStatus = asyncHandler(async (req, res) => {
  var franchise = await Franchise.findById(req.params.franchiseId);
  if (!franchise) {
    res.status(404);
    throw new Error('Franchise not found');
  }

  const newStatus = franchise.status === 'Active' ? 'Inactive' : 'Active';
  franchise.status = newStatus;
  await franchise.save();

  // ✅ ADDED — if deactivating, also disable canLogin for all staff
  if (newStatus === 'Inactive') {
    await User.updateMany(
      {
        franchiseId: franchise._id,
        role: { $in: ['StoreManager', 'InventoryStaff', 'PackingStaff'] },
      },
      { canLogin: false }
    );
  }

  // ✅ ADDED — if reactivating, re-enable canLogin for all staff
  if (newStatus === 'Active') {
    await User.updateMany(
      {
        franchiseId: franchise._id,
        role: { $in: ['StoreManager', 'InventoryStaff', 'PackingStaff'] },
      },
      { canLogin: true }
    );
  }

  res.json({
    success: true,
    message: `Franchise "${franchise.name}" is now ${newStatus}`,
    franchise: {
      _id:     franchise._id,
      name:    franchise.name,
      code:    franchise.code,
      status:  newStatus,
      manager: franchise.manager,
    },
  });
});

module.exports = {
  createFranchise,
  getFranchises,
  getFranchiseById,
  updateFranchise,
  deleteFranchise,
  getActiveFranchises,
  toggleFranchiseStatus,
};
