const asyncHandler = require("../middlewares/asyncHandler");
const Product = require("../models/productModel");

const previewBill = asyncHandler(async (req, res) => {
  const { items, discount = 0 } = req.body;  

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  let billItems = [];

  let grossAmount = 0;

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

    let price = 0;
    let mrp = 0;
    let stock = 0;
    let name = product.name;

    // ---------- Single Product ----------
    if (product.barcode === barcode) {
      price = product.offerPrice;
      mrp = product.mrp;
      stock = product.countInStock;
    }

    // ---------- WeightPack ----------
    if (price === 0) {
      for (const variant of product.flatVariants || []) {
        if (variant.barcode === barcode) {
          price = variant.offerPrice;
          mrp = variant.mrp;
          stock = variant.countInStock;
          break;
        }
      }
    }

    // ---------- ColorSize ----------
    if (price === 0) {
      for (const color of product.colorVariants || []) {
        for (const size of color.sizes) {
          if (size.barcode === barcode) {
            price = size.offerPrice;
            mrp = size.mrp;
            stock = size.countInStock;
            break;
          }
        }
      }
    }

    if (quantity > stock) {
      return res.status(400).json({
        success: false,
        message: `${name} has only ${stock} items in stock.`,
      });
    }

    const total = price * quantity;

    grossAmount += total;

    billItems.push({
      productId: product._id,
      name,
      barcode,
      quantity,
      mrp,
      price,
      total,
    });
  }

  const gst = 0;

  const netAmount = grossAmount - discount + gst;

  return res.json({
    success: true,

    bill: {
      items: billItems,

      grossAmount,

      discount,

      gst,

      netAmount,
    },
  });
});

module.exports = {
  previewBill,
};