const asyncHandler = require("../middlewares/asyncHandler");
const Bill = require("../models/billModel");
const FranchiseInventory = require("../models/franchiseInventoryModel");
const Offer = require("../models/offerModel");
const User = require("../models/userModel");
const Customer = require("../models/customerModel");

// ===============================
// Preview Bill (Rules Engine)
// POST /api/bills/preview
// ===============================
const previewBill = asyncHandler(async (req, res) => {
  const { items, customerId, couponCode } = req.body;
  const franchiseId = req.user?.franchiseId;

  if (!items || items.length === 0) {
    return res.json({ success: true, netAmount: 0, appliedOffers: [], items: [] });
  }

  // 1. Fetch active offers
  let query = {
    isActive: true,
    "validity.startDate": { $lte: new Date() },
    "validity.endDate": { $gte: new Date() },
  };

  if (franchiseId) {
    query.$or = [{ applicableFranchises: { $size: 0 } }, { applicableFranchises: franchiseId }];
  }

  let activeOffers = await Offer.find(query).populate("benefits.freeProduct.productId", "name mrp sellingPrice barcode");

  // Filter if coupon provided
  if (couponCode) {
    const couponMatch = activeOffers.find(o => o.code && o.code.toUpperCase() === couponCode.toUpperCase());
    if (couponMatch) {
      // Prioritize this coupon
      activeOffers = [couponMatch, ...activeOffers.filter(o => o._id.toString() !== couponMatch._id.toString())];
    }
  }

  let subtotal = 0;
  let totalSavings = 0;
  let appliedOffers = [];
  const finalItems = items.map(i => ({ ...i }));

  // Basic calculation first
  finalItems.forEach(item => {
    subtotal += Number(item.sellingPrice || 0) * Number(item.quantity || 0);
  });

  let currentTotal = subtotal;
  let offerApplied = false;

  let customerData = null;
  const mongoose = require("mongoose");
  if (customerId && mongoose.isValidObjectId(customerId)) {
    customerData = await Customer.findById(customerId);
  }

  // Process Offers
  let couponMatchId = null;
  if (couponCode) {
    const match = activeOffers.find(o => o.code && o.code.toUpperCase() === couponCode.toUpperCase());
    if (match) {
      couponMatchId = match._id.toString();
    }
  }

  let couponError = null;

  for (const offer of activeOffers) {
    // Basic checks
    if (offer.conditions.minBillAmount > 0 && currentTotal < offer.conditions.minBillAmount) {
      if (offer.code && couponCode?.toUpperCase() === offer.code.toUpperCase()) {
        couponError = `Minimum bill amount for this coupon is ₹${offer.conditions.minBillAmount}.`;
      }
      continue;
    }

    // Customer Type check
    if (offer.conditions.customerType && offer.conditions.customerType !== "All") {
      let isEligible = false;
      let failReason = "";
      if (customerData) {
        if (offer.conditions.customerType === "Frequent" && customerData.isFrequent) {
          isEligible = true;
        } else if (offer.conditions.customerType === "Frequent" && !customerData.isFrequent) {
          failReason = "This coupon is only for Frequent Customers.";
        } else if (offer.conditions.customerType === "New" && customerData.totalVisits === 0) {
          isEligible = true;
        } else if (offer.conditions.customerType === "New" && customerData.totalVisits > 0) {
          failReason = "This coupon is only for First-Time Customers.";
        }
      } else {
        // Unregistered / Walk-in is considered New
        if (offer.conditions.customerType === "New") {
           isEligible = true;
        } else if (offer.conditions.customerType === "Frequent") {
           failReason = "This coupon is only for Frequent Customers. Please register the customer first.";
        }
      }
      if (!isEligible) {
        if (offer.code && couponCode?.toUpperCase() === offer.code.toUpperCase()) {
          couponError = failReason || `Customer type not eligible for this coupon.`;
        }
        continue;
      }
    }
    
    // For manual coupon code
    if (offer.code && couponCode?.toUpperCase() !== offer.code.toUpperCase()) {
      continue; // Skip manual coupons unless explicitly passed
    }

    let isApplicable = false;
    let discount = 0;

    if (offer.type === "Bill Value Discount" || offer.type === "Flat Discount") {
      isApplicable = true;
      discount = offer.benefits.discountValue;
    } else if (offer.type === "Percentage Discount") {
      isApplicable = true;
      let calculatedDiscount = currentTotal * (offer.benefits.discountValue / 100);
      if (offer.benefits.maxDiscount > 0 && calculatedDiscount > offer.benefits.maxDiscount) {
        calculatedDiscount = offer.benefits.maxDiscount;
      }
      discount = calculatedDiscount;
    } else if (offer.type === "Free Product" && offer.benefits.freeProduct?.productId) {
      isApplicable = true;
      const freeItem = offer.benefits.freeProduct;
      finalItems.push({
        productId: freeItem.productId._id,
        name: freeItem.productId.name,
        barcode: freeItem.productId.barcode,
        quantity: freeItem.quantity,
        mrp: freeItem.productId.mrp,
        sellingPrice: 0,
        purchasePrice: 0,
        isFree: true,
      });
      // Add savings value
      totalSavings += freeItem.productId.sellingPrice * freeItem.quantity;
    } else if (offer.type === "Product Offer") {
      // Find matching products
      const matchingItems = finalItems.filter(i => 
        offer.conditions.applicableProducts.some(ap => ap.toString() === i.productId)
      );
      if (matchingItems.length > 0) {
        isApplicable = true;
        // Apply flat discount to those products (simplified)
        discount = offer.benefits.discountValue;
      }
    }

    if (isApplicable) {
      if (discount > 0) {
        currentTotal -= discount;
        totalSavings += discount;
      }
      appliedOffers.push({
        offerId: offer._id,
        name: offer.name,
        discountAmount: discount,
        freeProductId: offer.type === "Free Product" ? offer.benefits.freeProduct.productId._id : null
      });
      offerApplied = true;
      
      // Stop evaluating multiple bill discounts to prevent stacking overlapping % discounts
      if (offer.type === "Bill Value Discount" || offer.type === "Flat Discount" || offer.type === "Percentage Discount") {
        break;
      }
    }
  }

  if (couponCode) {
    if (!couponMatchId) {
      couponError = `Invalid or expired coupon code.`;
    } else if (!couponError) {
      const couponWasApplied = appliedOffers.some(o => o.offerId.toString() === couponMatchId);
      if (!couponWasApplied) {
        couponError = `Coupon not applied. Conditions may not be met for this cart.`;
      }
    }
  }

  const lastBill = await Bill.findOne().sort({ createdAt: -1 });
  let nextNumber = 15;
  if (lastBill && lastBill.billNo) {
    const match = String(lastBill.billNo).match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }
  let expectedBillNo = `BILL${String(nextNumber).padStart(5, "0")}`;

  const totalItems = finalItems.length;
  const totalQuantity = finalItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  res.json({
    success: true,
    subtotal,
    netAmount: currentTotal,
    totalSavings,
    appliedOffers,
    items: finalItems,
    couponError,
    billNo: expectedBillNo,
    totalItems,
    totalQuantity
  });
});

// ===============================
// Save Bill
// ===============================
const saveBill = asyncHandler(async (req, res) => {
  const {
    items,
    grossAmount,
    sellingAmount,
    savings,
    discount,
    couponDiscount,
    gst,
    netAmount,
    totalItems,
    totalQuantity,
    billNo,
    customerName,
    customerMobile,
    customerId,
    appliedOffers,
    totalSavings,
    paymentMode,
    customerPaid,
    changeReturned,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "No items found." });
  }

  const franchiseId = req.user?.franchiseId;
  if (!franchiseId) return res.status(403).json({ success: false, message: "A franchise assignment is required to save a bill." });

  const finalItems = [];
  let totalBillProfit = 0;

  // Fallback calculations if frontend failed to provide them
  const safeTotalItems = totalItems || items.length;
  const safeTotalQuantity = totalQuantity || items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  for (const item of items) {
    let remainingQuantity = Number(item.quantity);
    
    const batches = await FranchiseInventory.find({
      franchiseId,
      barcode: item.barcode,
      isActive: true,
      quantity: { $gt: 0 }
    }).sort({ expiryDate: 1, createdAt: 1 });

    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
    if (remainingQuantity > totalStock) {
      return res.status(400).json({ success: false, message: `${item.name || "Product"} no longer has enough stock.` });
    }

    for (const batch of batches) {
      if (remainingQuantity <= 0) break;

      const deductAmount = Math.min(batch.quantity, remainingQuantity);
      
      const updatedBatch = await FranchiseInventory.findOneAndUpdate(
        { _id: batch._id, quantity: { $gte: deductAmount } },
        { $inc: { quantity: -deductAmount } },
        { new: true }
      );

      if (!updatedBatch) {
        return res.status(400).json({ success: false, message: `Stock for ${item.name || "Product"} was updated during checkout.` });
      }

      updatedBatch.history.push({
        action: "SOLD",
        quantityChange: -deductAmount,
        previousQuantity: updatedBatch.quantity + deductAmount,
        newQuantity: updatedBatch.quantity,
        note: `Sold in bill`,
        performedBy: req.user._id
      });
      await updatedBatch.save();

      const purchasePrice = Number(batch.purchasePrice || 0);
      // If it's a free item injected by Offer Engine, sellingPrice is 0
      const sellingPrice = item.isFree ? 0 : Number(item.sellingPrice || batch.sellingPrice || 0);
      const profit = (sellingPrice - purchasePrice) * deductAmount;

      finalItems.push({
        productId: item.productId,
        name: item.name,
        barcode: item.barcode,
        quantity: deductAmount,
        mrp: item.mrp,
        purchasePrice,
        sellingPrice,
        total: sellingPrice * deductAmount,
        profit,
        location: item.location,
        inventoryId: batch._id,
        batchNumber: batch.batchNumber,
        isFree: item.isFree || false
      });

      totalBillProfit += profit;
      remainingQuantity -= deductAmount;
    }
  }

  const lastBill = await Bill.findOne().sort({ createdAt: -1 });
  let nextNumber = 15;
  if (lastBill && lastBill.billNo) {
    const match = String(lastBill.billNo).match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }
  const finalBillNo = `BILL${String(nextNumber).padStart(5, "0")}`;

  let finalCustomerId = (customerId && mongoose.isValidObjectId(customerId)) ? customerId : null;
  if (!finalCustomerId && customerMobile && customerMobile.length >= 10) {
    let cust = await Customer.findOne({ contactNo: customerMobile });
    if (!cust) {
      cust = await Customer.create({
        contactNo: customerMobile,
        username: customerName && customerName !== "Walk-in" ? customerName : "Walk-in Customer",
        franchiseId,
      });
    }
    finalCustomerId = cust._id;
  }

  const bill = await Bill.create({
    billNo: finalBillNo,
    franchiseId,
    cashierId: req.user._id,
    items: finalItems,
    grossAmount,
    sellingAmount,
    savings,
    discount,
    couponDiscount,
    gst,
    netAmount,
    totalProfit: totalBillProfit,
    totalItems: safeTotalItems,
    totalQuantity: safeTotalQuantity,
    customerId: finalCustomerId,
    customerName: customerName || "Walk-in",
    customerMobile,
    appliedOffers: appliedOffers || [],
    totalSavings: totalSavings || savings,
    paymentMode,
    customerPaid,
    changeReturned,
  });

  // Update Customer CRM stats if finalCustomerId is resolved
  if (finalCustomerId) {
    const cust = await Customer.findById(finalCustomerId);
    if (cust) {
      if (customerName && customerName !== "Walk-in" && cust.username !== customerName) {
        cust.username = customerName;
      }
      cust.totalVisits += 1;
      cust.totalPurchases += safeTotalQuantity;
      cust.totalSpent += netAmount;
      cust.totalSavings += (totalSavings || savings || 0);
      cust.lastVisit = new Date();
      if (cust.totalVisits > 10 || cust.totalSpent > 10000) {
        cust.isFrequent = true;
      }
      await cust.save();
    }
  }

  res.status(201).json({
    success: true,
    message: "Bill saved successfully.",
    bill,
  });
});

// ===============================
// Get All Bills
// ===============================
const getBills = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = req.user?.role === "Admin" ? {} : { franchiseId: req.user?.franchiseId };
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const bills = await Bill.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: bills.length, bills });
});

// ===============================
// Get Single Bill
// ===============================
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) return res.status(404).json({ success: false, message: "Bill not found." });
  res.json({ success: true, bill });
});

// ===============================
// Delete Bill
// ===============================
const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) return res.status(404).json({ success: false, message: "Bill not found." });
  await bill.deleteOne();
  res.json({ success: true, message: "Bill deleted successfully." });
});

module.exports = {
  previewBill,
  saveBill,
  getBills,
  getBillById,
  deleteBill,
};
