const asyncHandler = require("../middlewares/asyncHandler");
const Offer = require("../models/offerModel");

// ==========================================
// Get All Offers
// GET /api/offers
// ==========================================
const getOffers = asyncHandler(async (req, res) => {
  const { activeOnly } = req.query;
  const franchiseId = req.user?.franchiseId;

  let query = {};
  if (activeOnly === "true") {
    query.isActive = true;
    query["validity.startDate"] = { $lte: new Date() };
    query["validity.endDate"] = { $gte: new Date() };
  }

  // If StoreManager, only see offers applicable to their franchise (or global offers)
  if (req.user?.role !== "Admin" && franchiseId) {
    query.$or = [
      { applicableFranchises: { $size: 0 } },
      { applicableFranchises: franchiseId },
    ];
  }

  const offers = await Offer.find(query)
    .populate("conditions.applicableProducts", "name")
    .populate("benefits.freeProduct.productId", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: offers.length, offers });
});

// ==========================================
// Get Offer By ID
// GET /api/offers/:id
// ==========================================
const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate("conditions.applicableProducts", "name")
    .populate("benefits.freeProduct.productId", "name");

  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found." });
  }

  res.json({ success: true, offer });
});

// ==========================================
// Create Offer
// POST /api/offers
// ==========================================
const createOffer = asyncHandler(async (req, res) => {
  // StoreManagers can only create offers for their own franchise
  if (req.user?.role === "StoreManager") {
    req.body.applicableFranchises = [req.user.franchiseId];
  }

  if (req.body.code === "") {
    delete req.body.code;
  }

  // Same for freeProduct.productId being empty string
  if (req.body.benefits?.freeProduct?.productId === "") {
      delete req.body.benefits.freeProduct.productId;
  }

  const offer = await Offer.create(req.body);
  res.status(201).json({ success: true, offer });
});

// ==========================================
// Update Offer
// PUT /api/offers/:id
// ==========================================
const updateOffer = asyncHandler(async (req, res) => {
  let offer = await Offer.findById(req.params.id);
  
  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found." });
  }

  // Check permissions
  if (req.user?.role === "StoreManager") {
    if (!offer.applicableFranchises.includes(req.user.franchiseId)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this offer." });
    }
    req.body.applicableFranchises = [req.user.franchiseId]; // Prevent changing franchise
  }

  if (req.body.code === "") {
    req.body.code = null;
  }

  if (req.body.benefits?.freeProduct?.productId === "") {
      req.body.benefits.freeProduct.productId = null;
  }

  offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, offer });
});

// ==========================================
// Delete Offer
// DELETE /api/offers/:id
// ==========================================
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  
  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found." });
  }

  if (req.user?.role === "StoreManager") {
    if (!offer.applicableFranchises.includes(req.user.franchiseId)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this offer." });
    }
  }

  await offer.deleteOne();
  res.json({ success: true, message: "Offer removed" });
});

module.exports = {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
