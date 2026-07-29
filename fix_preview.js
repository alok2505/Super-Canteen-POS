const fs = require('fs');
const path = require('path');

const billControllerPath = path.join(__dirname, 'backend', 'controllers', 'billController.js');
let content = fs.readFileSync(billControllerPath, 'utf8');

// The new logic to replace the beginning of previewBill
const newLogic = `
  const FranchiseInventory = require("../models/franchiseInventoryModel");
  const Product = require("../models/productModel");

  if (!items || items.length === 0) {
    return res.json({ success: true, netAmount: 0, appliedOffers: [], items: [] });
  }

  const franchiseId = req.user?.franchiseId?.toString();
  let finalItems = [];
  let subtotal = 0;
  let totalSavings = 0;
  let grossAmount = 0;
  let totalItemsCount = 0;
  let totalQuantityCount = 0;

  for (const cartItem of items) {
    const { barcode, quantity, location } = cartItem;
    if (!barcode || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: "Each cart item needs a barcode and a positive quantity." });
    }

    const batches = franchiseId
      ? await FranchiseInventory.find({ franchiseId, barcode, isActive: true }).sort({ expiryDate: 1, createdAt: 1 }).lean()
      : [];

    const product = await Product.findOne(batches.length > 0 ? { _id: batches[0].productId } : {
      $or: [{ barcode }, { "flatVariants.barcode": barcode }, { "colorVariants.sizes.barcode": barcode }],
    }).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: \`Product not found for barcode \${barcode}\` });
    }

    let mrp = 0;
    let price = 0;
    let stock = 0;

    if (franchiseId) {
      if (batches.length === 0) return res.status(400).json({ success: false, message: \`\${product.name} is not available in this franchise.\` });
      const availableStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);
      if (Number(quantity) > availableStock) return res.status(400).json({ success: false, message: \`\${product.name} has only \${availableStock} item(s) left in stock.\` });

      const firstActiveBatch = batches.find(b => b.quantity > 0) || batches[0];
      const masterVariant = firstActiveBatch.masterVariantId && ([...(product.flatVariants || []), ...(product.colorVariants || []).flatMap((color) => color.sizes || [])].find((variant) => variant._id.toString() === firstActiveBatch.masterVariantId));
      
      mrp = Number(masterVariant?.mrp ?? product.mrp ?? 0);
      price = Number(firstActiveBatch.sellingPrice);
    } else {
      // Fallback for Admin
      let matched = false;
      if (product.barcode === barcode) { mrp = product.mrp; price = product.offerPrice; matched = true; }
      if (!matched) {
        for (const variant of product.flatVariants || []) {
          if (variant.barcode === barcode) { mrp = variant.mrp; price = variant.offerPrice; matched = true; break; }
        }
      }
      if (!matched) {
        outer: for (const c of product.colorVariants || []) {
          for (const s of c.sizes) {
            if (s.barcode === barcode) { mrp = s.mrp; price = s.offerPrice; matched = true; break outer; }
          }
        }
      }
      if (!matched) return res.status(404).json({ success: false, message: \`Product variant not found for barcode \${barcode}\` });
    }

    finalItems.push({
      productId: product._id,
      name: product.name,
      barcode,
      quantity: Number(quantity),
      mrp,
      sellingPrice: price,
      isFree: false,
    });

    subtotal += price * Number(quantity);
    grossAmount += mrp * Number(quantity);
    if (mrp > price) totalSavings += (mrp - price) * Number(quantity);
    totalItemsCount++;
    totalQuantityCount += Number(quantity);
  }

  // 1. Fetch active offers
`;

const searchRegex = /if \(\!items \|\| items\.length === 0\) \{[\s\S]*?finalItems\.forEach\(item => \{[\s\S]*?\}\);/m;
if (!searchRegex.test(content)) {
    console.log("Could not find the target code to replace!");
    process.exit(1);
}

content = content.replace(searchRegex, newLogic.trim());

const endRegex = /\/\/ Additional calculations for saveBill compatibility[\s\S]*?const billDiscount = subtotal \- currentTotal;/m;

const newEndLogic = `
  const billDiscount = subtotal - currentTotal; // Discount applied by rules engine
  totalSavings += billDiscount; // Add offer discount to savings
  const gst = 0; // Simplified for this logic

  let totalItems = totalItemsCount;
  let totalQuantity = totalQuantityCount;

  // Add free items into the totals
  finalItems.forEach(item => {
    if (item.isFree) {
      totalItems += 1;
      totalQuantity += item.quantity;
      // grossAmount += item.mrp * item.quantity; // Depending on how you account for free items in gross
    }
  });

  const sellingAmount = subtotal;
`;

content = content.replace(endRegex, newEndLogic.trim());

fs.writeFileSync(billControllerPath, content);
console.log("Updated billController.js!");
