const asyncHandler = require("../middlewares/asyncHandler");
const Bill = require("../models/billModel");
const FranchiseInventory = require("../models/franchiseInventoryModel");
const mongoose = require("mongoose");
const moment = require("moment"); // Assuming moment is available, or use native Date

// Helper to get date ranges
const getDateRanges = () => {
  const now = new Date();
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return { startOfToday, startOfWeek, startOfMonth };
};

// =====================================
// Get Dashboard Stats
// GET /api/reports/stats
// =====================================
const getDashboardStats = asyncHandler(async (req, res) => {
  const franchiseId = req.user.franchiseId;
  const { startDate, endDate } = req.query;

  if (!franchiseId && req.user.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Franchise assignment required." });
  }

  const matchStage = franchiseId ? { franchiseId: new mongoose.Types.ObjectId(franchiseId) } : {};

  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const bills = await Bill.find(matchStage).lean();

  const stats = {
    period: { sales: 0, profit: 0, count: 0 },
  };

  for (const bill of bills) {
    const amount = bill.netAmount || 0;
    const profit = bill.totalProfit || 0;

    stats.period.sales += amount;
    stats.period.profit += profit;
    stats.period.count += 1;
  }

  res.json({
    success: true,
    stats,
  });
});

// =====================================
// Get Low Stock Alerts
// GET /api/reports/low-stock
// =====================================
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const franchiseId = req.user.franchiseId;
  const threshold = parseInt(req.query.threshold) || 10;
  
  const matchStage = { isActive: true };
  if (franchiseId) {
    matchStage.franchiseId = new mongoose.Types.ObjectId(franchiseId);
  }

  // Aggregate stock by product/barcode
  const lowStockItems = await FranchiseInventory.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { productId: "$productId", barcode: "$barcode" },
        totalStock: { $sum: "$quantity" },
        docId: { $first: "$_id" }
      }
    },
    { $match: { totalStock: { $lte: threshold } } },
    {
      $lookup: {
        from: "products",
        localField: "_id.productId",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: "$docId",
        barcode: "$_id.barcode",
        name: "$product.name",
        totalStock: 1,
        image: { $arrayElemAt: ["$product.images", 0] },
      }
    },
    { $sort: { totalStock: 1 } }
  ]);

  res.json({
    success: true,
    count: lowStockItems.length,
    lowStockItems,
  });
});

module.exports = {
  getDashboardStats,
  getLowStockAlerts,
};
