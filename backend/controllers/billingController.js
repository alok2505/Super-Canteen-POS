const asyncHandler = require("../middlewares/asyncHandler");
const Product = require("../models/productModel");
const Bill = require("../models/billModel");
const FranchiseInventory = require("../models/franchiseInventoryModel");

const generateNextBillNo = async () => {
  const lastBill = await Bill.findOne().sort({ createdAt: -1 }).lean();

  let nextNumber = 1;

  if (lastBill?.billNo) {
    const match = String(lastBill.billNo).match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `BILL${String(nextNumber).padStart(5, "0")}`;
};

const previewBill = asyncHandler(async (req, res) => {
  const {
    items,
    discount = 0,
    couponDiscount = 0,
    gstPercentage = 0,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  let billItems = [];

  let grossAmount = 0;
  let sellingAmount = 0;
  let totalSavings = 0;
  let totalItems = 0;
  let totalQuantity = 0;

  for (const cartItem of items) {
    const { barcode, quantity, location } = cartItem;

    if (!barcode || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: "Each cart item needs a barcode and a positive quantity." });
    }

    const franchiseId = req.user?.franchiseId?.toString();
    const inventoryByVariantBarcode = franchiseId
      ? await FranchiseInventory.findOne({ franchiseId, $or: [{ barcode }, { "variants.barcode": barcode }] }).lean()
      : null;
    const product = await Product.findOne(inventoryByVariantBarcode ? { _id: inventoryByVariantBarcode.productId } : {
      $or: [
        { barcode },
        { "flatVariants.barcode": barcode },
        { "colorVariants.sizes.barcode": barcode },
      ],
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found for barcode ${barcode}`,
      });
    }

    // New multi-franchise inventory is stored separately from the master
    // catalog. A manager can bill only their own inventory record.
    if (franchiseId) {
      const inventory = inventoryByVariantBarcode || await FranchiseInventory.findOne({ franchiseId, productId: product._id }).lean();
      if (!inventory || !inventory.isActive) {
        return res.status(400).json({ success: false, message: `${product.name} is not available in this franchise.` });
      }
      const storeVariant = inventory.variants?.find((variant) => variant.barcode === barcode);
      if (!storeVariant && inventory.barcode !== barcode && product.barcode !== barcode) return res.status(400).json({ success: false, message: "This barcode is not configured for this franchise." });
      const availableStock = storeVariant?.stock ?? inventory.stock;
      if (Number(quantity) > availableStock) {
        return res.status(400).json({ success: false, message: `${product.name} has only ${availableStock} item(s) left in stock.` });
      }
      const masterVariant = storeVariant && ([...(product.flatVariants || []), ...(product.colorVariants || []).flatMap((color) => color.sizes || [])].find((variant) => variant._id.toString() === storeVariant.masterVariantId));
      const mrp = Number(masterVariant?.mrp ?? product.mrp ?? 0);
      const price = Number(storeVariant?.sellingPrice ?? inventory.sellingPrice);
      const mrpTotal = mrp * Number(quantity);
      const sellingTotal = price * Number(quantity);
      grossAmount += mrpTotal;
      sellingAmount += sellingTotal;
      totalSavings += mrpTotal - sellingTotal;
      totalItems++;
      totalQuantity += Number(quantity);
      billItems.push({ productId: product._id, inventoryId: inventory._id, inventoryVariantId: storeVariant?._id, name: product.name, image: product.images?.[0] || "", barcode, sku: product.sku || "", color: storeVariant?.color, size: storeVariant?.size, quantity: Number(quantity), mrp, sellingPrice: price, mrpTotal, sellingTotal, saving: mrpTotal - sellingTotal, stock: availableStock, location: storeVariant?.location || inventory.location });
      continue;
    }

    let mrp = 0;
    let price = 0;
    let stock = 0;
    let matched = false;

    let size = null;
    let color = null;

    let sku = "";
    let image = product.images?.[0] || "";

    // -----------------------------
    // Single Product
    // -----------------------------

    if (product.barcode === barcode) {
      mrp = product.mrp;
      price = product.offerPrice;
      stock = product.countInStock;

      sku = product.sku;
      size = product.size;
      matched = true;
    }

    // -----------------------------
    // Weight Pack
    // -----------------------------

    if (!matched) {
      for (const variant of product.flatVariants || []) {
        if (variant.barcode === barcode) {
          mrp = variant.mrp;
          price = variant.offerPrice;
          stock = variant.countInStock;

          sku = variant.sku;
          size = variant.size;
          matched = true;

          break;
        }
      }
    }

    // -----------------------------
    // Color Size
    // -----------------------------

    if (!matched) {
      outer:
      for (const c of product.colorVariants || []) {
        for (const s of c.sizes) {
          if (s.barcode === barcode) {
            mrp = s.mrp;
            price = s.offerPrice;
            stock = s.countInStock;

            sku = s.sku;
            size = s.size;
            color = c.name;
            matched = true;

            break outer;
          }
        }
      }
    }

    if (!matched) {
      return res.status(404).json({ success: false, message: `Product variant not found for barcode ${barcode}` });
    }

    // Store staff sell from their own franchise inventory, not the master stock.
    const legacyFranchiseId = req.user?.franchiseId?.toString();
    if (legacyFranchiseId) {
      const inventory = product.franchiseInventories?.find(
        (entry) => entry.franchiseId?.toString() === legacyFranchiseId,
      );
      if (!inventory || !inventory.isEnable) {
        return res.status(400).json({ success: false, message: `${product.name} is not enabled for this franchise.` });
      }

      if (product.barcode === barcode) {
        mrp = inventory.mrp;
        price = inventory.offerPrice;
        stock = inventory.countInStock;
      } else {
        const flatVariant = inventory.flatVariants?.find((variant) => variant.barcode === barcode);
        if (flatVariant) {
          mrp = flatVariant.mrp;
          price = flatVariant.offerPrice;
          stock = flatVariant.countInStock;
        } else {
          let storeSize;
          for (const storeColor of inventory.colorVariants || []) {
            storeSize = storeColor.sizes?.find((entry) => entry.barcode === barcode);
            if (storeSize) break;
          }
          if (!storeSize) {
            return res.status(400).json({ success: false, message: `${product.name} is not configured for this franchise.` });
          }
          mrp = storeSize.mrp;
          price = storeSize.offerPrice;
          stock = storeSize.countInStock;
        }
      }
    }

    if (quantity > stock) {
      return res.status(400).json({
        success: false,
        message: `${product.name} has only ${stock} item(s) left in stock.`,
      });
    }

    const mrpTotal = mrp * quantity;

    const sellingTotal = price * quantity;

    const saving = mrpTotal - sellingTotal;

    grossAmount += mrpTotal;

    sellingAmount += sellingTotal;

    totalSavings += saving;

    totalItems++;

    totalQuantity += quantity;

    billItems.push({
      productId: product._id,

      name: product.name,

      image,

      barcode,

      sku,

      color,

      size,

      quantity,

      mrp,

      sellingPrice: price,

      mrpTotal,

      sellingTotal,

      saving,

      stock,

      location,
    });
  }

    // ==========================================
  // Bill Calculations
  // ==========================================

  const billDiscount = Number(discount);
  const coupon = Number(couponDiscount);
  const billNo = await generateNextBillNo();

  // GST on selling amount after discounts
  const taxableAmount =
    sellingAmount - billDiscount - coupon;

  const gst =
    (taxableAmount * Number(gstPercentage)) / 100;

  // Amount before round off
  const amountBeforeRound =
    taxableAmount + gst;

  // Round to nearest rupee
  const roundedAmount = Math.round(amountBeforeRound);

  const roundOff =
    roundedAmount - amountBeforeRound;

  const netAmount = roundedAmount;

 return res.json({
  success: true,
  billNo,
  bill: {
    items: billItems,
    grossAmount,
    sellingAmount,
    savings: totalSavings,
    discount: billDiscount,
    couponDiscount: coupon,
    gst,
    netAmount,
    totalItems,
    totalQuantity,
    billNo,
  }
});
});
module.exports = {
  previewBill,
};
