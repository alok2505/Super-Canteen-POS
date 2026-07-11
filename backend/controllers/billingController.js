const asyncHandler = require("../middlewares/asyncHandler");
const Product = require("../models/productModel");

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
    const { barcode, quantity } = cartItem;

    const product = await Product.findOne({
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

    let mrp = 0;
    let price = 0;
    let stock = 0;

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
    }

    // -----------------------------
    // Weight Pack
    // -----------------------------

    if (price === 0) {
      for (const variant of product.flatVariants || []) {
        if (variant.barcode === barcode) {
          mrp = variant.mrp;
          price = variant.offerPrice;
          stock = variant.countInStock;

          sku = variant.sku;
          size = variant.size;

          break;
        }
      }
    }

    // -----------------------------
    // Color Size
    // -----------------------------

    if (price === 0) {
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

            break outer;
          }
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
    });
  }

    // ==========================================
  // Bill Calculations
  // ==========================================

  const billDiscount = Number(discount);
  const coupon = Number(couponDiscount);

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
  bill: {
    billNumber: `BILL-${Date.now()}`,
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
  }
});
});
module.exports = {
  previewBill,
};
