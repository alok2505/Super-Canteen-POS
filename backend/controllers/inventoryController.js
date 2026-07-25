const asyncHandler = require("../middlewares/asyncHandler");
const FranchiseInventory = require("../models/franchiseInventoryModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// @desc    Get inventory items with location filters and search
// @route   GET /api/inventory/location
// @access  Private (INVENTORY_VIEW_ROLES)
const getLocationInventory = asyncHandler(async (req, res) => {
  const { search, section, rack, shelf, bin, page = 1, limit = 20, franchiseId: queryFranchiseId } = req.query;

  // Admin users can pass franchiseId in query, others use their assigned franchiseId
  const franchiseId = req.user.role === 'Admin' ? queryFranchiseId : req.user.franchiseId;

  if (!franchiseId) {
    return res.status(400).json({ success: false, message: "Franchise ID is required" });
  }

  const matchStage = { franchiseId: new mongoose.Types.ObjectId(franchiseId) };

  // Location filters
  if (section) matchStage['location.section'] = section;
  if (rack) matchStage['location.rack'] = rack;
  if (shelf) matchStage['location.shelf'] = shelf;
  if (bin) matchStage['location.bin'] = bin;

  // Search filter
  if (search) {
    // First, find matching products by name or SKU
    const matchingProducts = await Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ]
    }).select('_id').lean();

    const productIds = matchingProducts.map(p => p._id);

    // Then, match batches by barcode, batchNumber, OR if their productId is in matchingProducts
    matchStage.$or = [
      { barcode: { $regex: search, $options: "i" } },
      { batchNumber: { $regex: search, $options: "i" } }
    ];
    if (productIds.length > 0) {
      matchStage.$or.push({ productId: { $in: productIds } });
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await FranchiseInventory.countDocuments(matchStage);

  const batches = await FranchiseInventory.find(matchStage)
    .populate("productId", "name sku")
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const formattedInventory = batches.map(item => ({
    _id: item._id,
    productName: item.productId?.name || "Unknown",
    sku: item.productId?.sku || "",
    barcode: item.barcode,
    batchNumber: item.batchNumber,
    section: item.location?.section || "",
    rack: item.location?.rack || "",
    shelf: item.location?.shelf || "",
    bin: item.location?.bin || "",
    availableStock: item.quantity,
    purchasePrice: item.purchasePrice,
    sellingPrice: item.sellingPrice,
    expiryDate: item.expiryDate,
    manufactureDate: item.manufactureDate
  }));

  res.json({
    success: true,
    count: total,
    inventory: formattedInventory,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page)
  });
});

// @desc    Get aggregated stock for products across all batches
// @route   GET /api/inventory/stock
// @access  Private (INVENTORY_VIEW_ROLES)
const getAggregatedStock = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20, franchiseId: queryFranchiseId } = req.query;

  const franchiseId = req.user.role === 'Admin' ? queryFranchiseId : req.user.franchiseId;

  if (!franchiseId) {
    return res.status(400).json({ success: false, message: "Franchise ID is required" });
  }

  let productMatchStage = {};
  if (search) {
    const matchingProducts = await Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ]
    }).select('_id').lean();
    
    const matchingBatches = await FranchiseInventory.find({
      franchiseId: new mongoose.Types.ObjectId(franchiseId),
      barcode: { $regex: search, $options: "i" }
    }).distinct('productId');

    const productIdsToMatch = [...new Set([...matchingProducts.map(p => String(p._id)), ...matchingBatches.map(id => String(id))])];
    
    productMatchStage = { productId: { $in: productIdsToMatch.map(id => new mongoose.Types.ObjectId(id)) } };
  }

  const pipeline = [
    { $match: { franchiseId: new mongoose.Types.ObjectId(franchiseId), ...productMatchStage } },
    {
      $group: {
        _id: "$productId",
        totalStock: { $sum: "$quantity" },
        barcodes: { $addToSet: "$barcode" },
        batchesCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 1,
        productName: "$productDetails.name",
        sku: "$productDetails.sku",
        productType: "$productDetails.productType",
        images: "$productDetails.images",
        totalStock: 1,
        barcodes: 1,
        batchesCount: 1
      }
    },
    { $sort: { productName: 1 } },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) }
  ];

  const stockData = await FranchiseInventory.aggregate(pipeline);

  const countPipeline = [
    { $match: { franchiseId: new mongoose.Types.ObjectId(franchiseId), ...productMatchStage } },
    { $group: { _id: "$productId" } },
    { $count: "total" }
  ];
  const countResult = await FranchiseInventory.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  res.json({
    success: true,
    count: total,
    stock: stockData,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page)
  });
});

module.exports = {
  getLocationInventory,
  getAggregatedStock
};
