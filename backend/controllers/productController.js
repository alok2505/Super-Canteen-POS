const { default: mongoose } = require("mongoose");
const asyncHandler = require("../middlewares/asyncHandler.js");
const Product = require("../models/productModel.js");
const FranchiseInventory = require("../models/franchiseInventoryModel.js");
// const SlabRequest = require("../models/slabRequest.js");
const moment = require("moment-timezone");
// const brand = require("../models/brand.js");
// const categoryModel = require("../models/categoryModel.js");
// const subCategorySchema = require("../models/subCategorySchema.js");
// const segmentSchema = require("../models/segmentSchema.js");
// const checkModelReferences = require("../utils/checkModelReferences.js");
// const stockNotificationSchema = require("../models/stockNotificationSchema.js");
// const Notification = require("../models/notification");
// const { sendToUser } = require("../socket/socket.server.js");
// const { createNotification } = require("./notificationController.js");
// const admin = require("firebase-admin");
// const Franchise   = require('../models/franchiseSchema.js');

//singleStore
// const addProduct = asyncHandler(async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       mrp,
//       offerPrice,
//       category,
//       subCategory,
//       rating,
//       segment,
//       brand,
//       countInStock,
//       specification,
//       aboutTheBrand,
//       lowStockThreshold,
//       createdBy,
//       tax,
//       discountPercent,
//       discountExpires,
//       returnable,
//       returnWindow,
//       warrantyPeriod,
//       isFeatured,
//       isBestSeller,
//       visibility,
//       minQuantity,
//       maxQuantity,
//       productType, // "Single" | "ColorSize" | "WeightPack"
//     } = req.fields;

//     // Extract images
//     const imageUrls = Object.keys(req.fields)
//       .filter((key) => key.startsWith("imageUrls"))
//       .map((key) => req.fields[key]);

//     if (!imageUrls.length) {
//       return res.status(400).json({ error: "At least one image URL is required" });
//     }

//     // Extract coupons
//     const productCoupons = Object.keys(req.fields)
//       .filter((key) => key.startsWith("coupons["))
//       .map((key) => req.fields[key]);

//     // Extract tags
//     const tags = Object.keys(req.fields)
//       .filter((key) => key.startsWith("tags["))
//       .map((key) => req.fields[key]);

//     // Extract keywords
//     const keywords = Object.keys(req.fields)
//       .filter((key) => key.startsWith("keywords["))
//       .map((key) => req.fields[key]);

//     // Extract product-level color
//     let color = null;
//     if (req.fields.color) {
//       try {
//         color = typeof req.fields.color === "string" ? JSON.parse(req.fields.color) : req.fields.color;
//         color.name = color.name || "";
//         color.code = color.code || "";
//       } catch {
//         color = null;
//       }
//     }

//     // Extract product-level size
//     let size = req.fields.size || null;

//     // Extract variants
//     const variantsRaw = req.fields.variants ? JSON.parse(req.fields.variants) : [];
//     let colorVariants = [];
//     let flatVariants = [];

//     if (variantsRaw.length > 0) {
//     if (productType === "ColorSize") {
//   colorVariants = variantsRaw.map((v) => ({
//     name: v.name || "",
//     code: v.code || "",
//     images: Array.isArray(v.images) ? v.images : [],
//     sizes: Array.isArray(v.sizes)
//       ? v.sizes.map((s) => ({
//           size: s.size,
//           mrp: s.mrp,
//           offerPrice: s.offerPrice,
//           countInStock: s.countInStock || 0,
//           sku: s.sku || "",
//           minOrderQuantity: s.minOrderQuantity || 1,
//           maxOrderQuantity: s.maxOrderQuantity || null,
//           variantStockThreshold: s.variantStockThreshold || 5,
//         }))
//       : [],
//   }));
// }
//  else if (productType === "WeightPack") {
//         flatVariants = variantsRaw.map((v) => ({
//           size: v.size,
//           mrp: v.mrp,
//           offerPrice: v.offerPrice,
//           images: Array.isArray(v.images) ? v.images : [],
//           countInStock: v.countInStock || 0,
//           sku: v.sku || "",
//           minOrderQuantity: v.minOrderQuantity || 1,
//           maxOrderQuantity: v.maxOrderQuantity || null,
//           variantStockThreshold: v.variantStockThreshold || 5,
//         }));
//       }
//     }

//     // Extract attributes
//     const attributes = [];
//     for (const key in req.fields) {
//       const match = key.match(/attributes\[(\d+)\]\[(.+)\]/);
//       if (match) {
//         const index = match[1];
//         const field = match[2];
//         if (!attributes[index]) attributes[index] = {};
//         attributes[index][field] = req.fields[key];
//       }
//     }
//     const cleanedAttributes = attributes.filter(
//       (attr) => attr.key?.trim() !== "" || attr.value?.trim() !== ""
//     );

//     // Extract deliveryTime
//     const deliveryTime = req.fields.deliveryTime ? JSON.parse(req.fields.deliveryTime) : null;

//     // Create product
//     const product = new Product({
//       name,
//       description,
//       mrp,
//       offerPrice,
//       category,
//       subCategory: mongoose.Types.ObjectId.isValid(subCategory) ? subCategory : undefined,
//       segment: mongoose.Types.ObjectId.isValid(segment) ? segment : undefined,
//       brand: mongoose.Types.ObjectId.isValid(brand) ? brand : undefined,
//       countInStock,
//       coupons: productCoupons,
//       images: imageUrls,
//       specification,
//       aboutTheBrand,
//       lowStockThreshold,
//       createdBy,
//       rating,
//       tax,
//       discountPercent,
//       discountExpires: discountExpires ? new Date(discountExpires) : null,
//       returnable,
//       returnWindow,
//       warrantyPeriod,
//       deliveryTime,
//       isFeatured,
//       isBestSeller,
//       visibility,
//       tags,
//       keywords,
//       color: color || null,
//       size: size || null,
//       colorVariants,
//       flatVariants,
//       hasVariants: colorVariants.length > 0 || flatVariants.length > 0,
//       attributes: cleanedAttributes,
//       minOrderQuantity: minQuantity,
//       maxOrderQuantity: maxQuantity,
//       productType,
//     });

//     await product.save();
//     res.json(product);
//   } catch (error) {
//     console.error("Error in addProduct:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

//new as per franchize modal
const addProduct = asyncHandler(async (req, res) => {
  try {
    const fields = req.fields || req.body || {};
    const {
      name,
      description,
      mrp,
      offerPrice,
      category,
      subCategory,
      rating,
      segment,
      brand,
      countInStock,
      specification,
      aboutTheBrand,
      lowStockThreshold,
      createdBy,
      tax,
      returnable,
      returnWindow,
      warrantyPeriod,
      isFeatured,
      isBestSeller,
      visibility,
      minQuantity,
      maxQuantity,
      productType,
    } = fields;

    const role = req.user?.role;
    const franchiseId = req.user?.franchiseId;
    if (role !== "StoreManager" || !franchiseId) {
      return res.status(403).json({ success: false, message: "Only an assigned Store Manager can add products." });
    }

    const imageUrls = Array.isArray(fields.images) ? fields.images : Object.keys(fields)
      .filter((key) => key.startsWith("imageUrls"))
      .map((key) => fields[key]);

    const productCoupons = Object.keys(fields)
      .filter((key) => key.startsWith("coupons["))
      .map((key) => fields[key]);
    const tags = Object.keys(fields)
      .filter((key) => key.startsWith("tags["))
      .map((key) => fields[key]);
    const keywords = Object.keys(fields)
      .filter((key) => key.startsWith("keywords["))
      .map((key) => fields[key]);

    let color = null;
    if (fields.color) {
      try {
        color =
          typeof fields.color === "string"
            ? JSON.parse(fields.color)
            : fields.color;
        color.name = color.name || "";
        color.code = color.code || "";
      } catch {
        color = null;
      }
    }
    const size = fields.size || null;

    const variantsRaw = fields.variants
      ? (typeof fields.variants === "string" ? JSON.parse(fields.variants) : fields.variants)
      : [];
    let colorVariants = [];
    let flatVariants = [];

    if (variantsRaw.length > 0) {
      if (productType === "ColorSize") {
        colorVariants = variantsRaw.map((v) => ({
          name: v.name || "",
          code: v.code || "",
          images: Array.isArray(v.images) ? v.images : [],
          sizes: Array.isArray(v.sizes)
            ? v.sizes.map((s) => ({
                size: s.size,
                mrp: Number(s.mrp) || 0,
                offerPrice: Number(s.offerPrice) || 0,
                countInStock: Number(s.countInStock) || 0,
                sku: s.sku || "",
                barcode: s.barcode?.trim() || "",
                minOrderQuantity: Number(s.minOrderQuantity) || 1,
                maxOrderQuantity: s.maxOrderQuantity || null,
                variantStockThreshold: Number(s.variantStockThreshold) || 5,
              }))
            : [],
        }));
      } else if (productType === "WeightPack") {
        flatVariants = variantsRaw.map((v) => ({
          size: v.size,
          mrp: Number(v.mrp) || 0,
          offerPrice: Number(v.offerPrice) || 0,
          images: Array.isArray(v.images) ? v.images : [],
          countInStock: Number(v.countInStock) || 0,
          sku: v.sku || "",
          barcode: v.barcode?.trim() || "",
          minOrderQuantity: Number(v.minOrderQuantity) || 1,
          maxOrderQuantity: v.maxOrderQuantity || null,
          variantStockThreshold: Number(v.variantStockThreshold) || 5,
        }));
      }
    }

    const attributes = [];
    for (const key in fields) {
      const match = key.match(/attributes\[(\d+)\]\[(.+)\]/);
      if (match) {
        const index = match[1];
        const field = match[2];
        if (!attributes[index]) attributes[index] = {};
        attributes[index][field] = fields[key];
      }
    }
    const cleanedAttributes = attributes.filter(
      (attr) => attr.key?.trim() !== "" || attr.value?.trim() !== "",
    );

    // ── Auto-push blank inventory entry to ALL active franchises ─────────────
    //     const activeFranchises = await Franchise.find({ status: "Active" }).select("_id");

    // const franchiseInventories = activeFranchises.map((f) => ({
    //   franchiseId:       f._id,
    //   mrp:               Number(mrp)        || 0,
    //   offerPrice:        Number(offerPrice) || 0,
    //   countInStock:      0,
    //   lowStockThreshold: Number(lowStockThreshold) || 10,
    //   minOrderQuantity:  Number(minQuantity) || 1,
    //   maxOrderQuantity:  Number(maxQuantity) || null,
    //   outOfStock:        true,
    //   isEnable:          false,
    //   // ✅ deep clone — critical
    //   flatVariants: productType === "WeightPack"
    //     ? JSON.parse(JSON.stringify(flatVariants)).map(v => ({ ...v, countInStock: 0 }))
    //     : [],
    //   colorVariants: productType === "ColorSize"
    //     ? JSON.parse(JSON.stringify(colorVariants)).map(cv => ({
    //         ...cv,
    //         sizes: cv.sizes.map(s => ({ ...s, countInStock: 0 })),
    //       }))
    //     : [],
    // }));

    const franchiseInventories = [{
      franchiseId,
      mrp: Number(mrp) || 0,
      offerPrice: Number(offerPrice) || 0,
      countInStock: Number(countInStock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      minOrderQuantity: Number(minQuantity) || 1,
      maxOrderQuantity: Number(maxQuantity) || null,
      outOfStock: Number(countInStock) <= 0,
      isEnable: Number(countInStock) > 0,
      flatVariants,
      colorVariants,
    }];

    const product = new Product({
      name,
      description,
      mrp: Number(mrp) || 0,
      offerPrice: Number(offerPrice) || 0,
      sku: fields.sku || undefined,
      barcode: fields.barcode || undefined,
      countInStock: Number(countInStock) || 0,
      category,
      subCategory: mongoose.Types.ObjectId.isValid(subCategory)
        ? subCategory
        : undefined,
      segment: mongoose.Types.ObjectId.isValid(segment) ? segment : undefined,
      brand: mongoose.Types.ObjectId.isValid(brand) ? brand : undefined,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      minOrderQuantity: Number(minQuantity) || 1,
      maxOrderQuantity: Number(maxQuantity) || null,
      coupons: productCoupons,
      images: imageUrls,
      specification,
      aboutTheBrand,
      createdBy: createdBy || req.user?._id,
      rating: Number(rating) || 0,
      tax: Number(tax) || 0,
      returnable: returnable !== undefined ? Boolean(returnable) : true,
      returnWindow: Number(returnWindow) || 7,
      warrantyPeriod,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      visibility: visibility || "Public",
      tags,
      keywords,
      color: color || null,
      size: size || null,
      colorVariants,
      flatVariants,
      hasVariants: colorVariants.length > 0 || flatVariants.length > 0,
      attributes: cleanedAttributes,
      productType,
      franchiseInventories,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: `Product created and linked to store(s). Stores must activate it.`,
      product,
      // linkedStores: activeFranchises.length, //testing
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({ error: error.message });
  }
});

//single store version - 1.1
// const updateProductDetails = asyncHandler(async (req, res) => {
//   const id = req.params.id;

//   try {
//     const existingProduct = await Product.findById(id);
//     if (!existingProduct) return res.status(404).json({ error: "Product not found" });

//     const fields = req.fields || req.body || {};

//     // Extract core fields
//     let {
//       name, description, mrp, offerPrice, category, subCategory, rating,
//       segment, brand, countInStock, specification, aboutTheBrand, lowStockThreshold,
//       createdBy, tax, discountPercent, discountExpires, returnable,
//       returnWindow, warrantyPeriod, isFeatured, isBestSeller, visibility,
//       minQuantity, maxQuantity, productType, outOfStock
//     } = fields;

// // Images handling
// let updatedImages = existingProduct.images || [];
// let newImageUrls = Array.isArray(fields.images)
//   ? fields.images
//   : (fields.images ? JSON.parse(fields.images) : []);

// let removedImages = Array.isArray(fields.removedImages)
//   ? fields.removedImages
//   : (fields.removedImages ? JSON.parse(fields.removedImages) : []);

// // Remove deleted images
// if (removedImages.length) updatedImages = updatedImages.filter(img => !removedImages.includes(img));

// // Add new images
// if (newImageUrls.length) updatedImages = [...updatedImages, ...newImageUrls];

// // ✅ Remove duplicates
// updatedImages = [...new Set(updatedImages)];

//     // Coupons, tags, keywords
//     const updatedCoupons = fields.coupons
//       ? (typeof fields.coupons === "string" ? JSON.parse(fields.coupons) : fields.coupons)
//       : existingProduct.coupons || [];

//       // Tags & Keywords
// const updatedTags = fields.tags !== undefined
//   ? (typeof fields.tags === "string" ? JSON.parse(fields.tags) : fields.tags)
//   : existingProduct.tags || [];

// const updatedKeywords = fields.keywords !== undefined
//   ? (typeof fields.keywords === "string" ? JSON.parse(fields.keywords) : fields.keywords)
//   : existingProduct.keywords || [];

//     // Delivery time
//     let deliveryTime = existingProduct.deliveryTime || { value: 0, unit: "days" };
//     if (fields.deliveryTime) {
//       try { deliveryTime = typeof fields.deliveryTime === "string" ? JSON.parse(fields.deliveryTime) : fields.deliveryTime; }
//       catch {}
//     }

//     // Color & Size
//        let color = existingProduct.color || { name: "", code: "" };
//     if (fields.color) color = typeof fields.color === "string" ? JSON.parse(fields.color) : fields.color;
//     color.name = color.name !== undefined ? color.name : existingProduct.color?.name || "";
//     color.code = color.code || existingProduct.color?.code || "";

//     let size = fields.size !== undefined
//       ? (typeof fields.size === "string" ? fields.size : fields.size.value || fields.size)
//       : existingProduct.size || "";

// // --- Variants ---
// let variantsRaw = Array.isArray(fields.variants) ? fields.variants : (fields.variants ? JSON.parse(fields.variants) : []);
// let colorVariants = existingProduct.colorVariants || [];
// let flatVariants = existingProduct.flatVariants || [];

// // Preserve _id for existing variants and sizes
// if (variantsRaw.length > 0) {
//   if (productType === "ColorSize") {
//     colorVariants = variantsRaw.map((v, index) => {
//       const existing = existingProduct.colorVariants?.[index] || {};
//       return {
//         _id: existing._id, // preserve old _id
//         name: v.name ?? existing.name ?? "",
//         code: v.code ?? existing.code ?? "",
//         images: Array.isArray(v.images) ? v.images : existing.images || [],
//         sizes: Array.isArray(v.sizes)
//           ? v.sizes.map((s, sIndex) => {
//               const existingSize = existing.sizes?.[sIndex] || {};
//               return {
//                 _id: existingSize._id, // preserve old size _id
//                 size: s.size ?? existingSize.size ?? "",
//                 mrp: s.mrp ?? existingSize.mrp ?? 0,
//                 offerPrice: s.offerPrice ?? existingSize.offerPrice ?? 0,
//                 countInStock: s.countInStock ?? existingSize.countInStock ?? 0,
//                 sku: s.sku ?? existingSize.sku ?? "",
//                 minOrderQuantity: s.minOrderQuantity ?? existingSize.minOrderQuantity ?? 1,
//                 maxOrderQuantity: s.maxOrderQuantity ?? existingSize.maxOrderQuantity ?? null,
//                 variantStockThreshold: s.variantStockThreshold ?? existingSize.variantStockThreshold ?? 5,
//               };
//             })
//           : existing.sizes || [],
//       };
//     });
//   } else if (productType === "WeightPack") {
//     flatVariants = variantsRaw.map((v, index) => {
//       const existing = existingProduct.flatVariants?.[index] || {};
//       return {
//         _id: existing._id, // preserve old _id
//         size: v.size ?? existing.size ?? null,
//         mrp: v.mrp ?? existing.mrp ?? 0,
//         offerPrice: v.offerPrice ?? existing.offerPrice ?? 0,
//         images: Array.isArray(v.images) ? v.images : existing.images || [],
//         countInStock: v.countInStock ?? existing.countInStock ?? 0,
//         sku: v.sku ?? existing.sku ?? "",
//         minOrderQuantity: v.minOrderQuantity ?? existing.minOrderQuantity ?? 1,
//         maxOrderQuantity: v.maxOrderQuantity ?? existing.maxOrderQuantity ?? null,
//         variantStockThreshold: v.variantStockThreshold ?? existing.variantStockThreshold ?? 5,
//       };
//     });
//   }
// }

// // Ensure variants exist if nothing provided
// flatVariants = flatVariants.length > 0 ? flatVariants : JSON.parse(JSON.stringify(existingProduct.flatVariants || []));
// colorVariants = colorVariants.length > 0 ? colorVariants : JSON.parse(JSON.stringify(existingProduct.colorVariants || []));

//     // Attributes
//     const attributes = [];
//     for (const key in fields) {
//       const match = key.match(/attributes\[(\d+)\]\[(.+)\]/);
//       if (match) {
//         const index = match[1];
//         const field = match[2];
//         if (!attributes[index]) attributes[index] = {};
//         attributes[index][field] = fields[key];
//       }
//     }
//     const cleanedAttributes = attributes.filter(attr => attr.key?.trim() || attr.value?.trim());

//     // Always ensure variants exist
//     flatVariants = flatVariants.length > 0 ? flatVariants : JSON.parse(JSON.stringify(existingProduct.flatVariants || []));
//     colorVariants = colorVariants.length > 0 ? colorVariants : JSON.parse(JSON.stringify(existingProduct.colorVariants || []));

//     // 🔹 TOGGLE LOGIC vs FULL PAYLOAD LOGIC
//     if (Object.keys(fields).length === 1 && ('outOfStock' in fields)) {
//       // Only toggle mode
//       flatVariants = JSON.parse(JSON.stringify(flatVariants));
//       colorVariants = JSON.parse(JSON.stringify(colorVariants));

//       if (fields.outOfStock === true || fields.outOfStock === "true") {
//         existingProduct.backupStock = {
//           countInStock: existingProduct.countInStock,
//           flatVariants: JSON.parse(JSON.stringify(flatVariants)),
//           colorVariants: JSON.parse(JSON.stringify(colorVariants))
//         };
//         countInStock = 0;
//         flatVariants.forEach(v => v.countInStock = 0);
//         colorVariants.forEach(c => { if (Array.isArray(c.sizes)) c.sizes.forEach(s => s.countInStock = 0); });
//       } else if (fields.outOfStock === false || fields.outOfStock === "false") {
//         if (existingProduct.backupStock) {
//           countInStock = existingProduct.backupStock.countInStock;
//           flatVariants = JSON.parse(JSON.stringify(existingProduct.backupStock.flatVariants || []));
//           colorVariants = JSON.parse(JSON.stringify(existingProduct.backupStock.colorVariants || []));
//         }
//       }
//       outOfStock = !!fields.outOfStock;
//     } else {
//       // Full payload mode → take countInStock directly
//       countInStock = Number(countInStock || existingProduct.countInStock);
//       outOfStock = (countInStock === 0) && (flatVariants.every(v => v.countInStock === 0));
//     }

//     // Prepare setFields
//     const setFields = {
//       name,
//       description,
//       mrp,
//       offerPrice,
//       category,
//       subCategory: subCategory === "" ? null : (mongoose.Types.ObjectId.isValid(subCategory) ? subCategory : existingProduct.subCategory),
//       segment: segment === "" ? null : (mongoose.Types.ObjectId.isValid(segment) ? segment : existingProduct.segment),
//       brand: brand === "" ? null : (mongoose.Types.ObjectId.isValid(brand) ? brand : existingProduct.brand),
//       countInStock,
//       images: updatedImages,
//       coupons: updatedCoupons,
//       aboutTheBrand: fields.aboutTheBrand !== undefined ? fields.aboutTheBrand : existingProduct.aboutTheBrand,
//       specification: fields.specification !== undefined ? fields.specification : existingProduct.specification,
//       lowStockThreshold,
//       createdBy,
//       rating,
//       tax,
//       discountPercent,
//       discountExpires: discountExpires ? new Date(discountExpires) : existingProduct.discountExpires,
//       returnable,
//       returnWindow,
//       warrantyPeriod,
//       deliveryTime,
//       isFeatured,
//       isBestSeller,
//       visibility,
//       tags: updatedTags,
//       keywords: updatedKeywords,
//       color: color || null,
//       size: size || null,
//       colorVariants,
//       flatVariants,
//       hasVariants: colorVariants.length > 0 || flatVariants.length > 0,
//       attributes: cleanedAttributes,
//       minOrderQuantity: minQuantity,
//       maxOrderQuantity: maxQuantity,
//       productType,
//       outOfStock,
//       isEnable: fields.isEnable === "true" || fields.isEnable === true,
//       backupStock: existingProduct.backupStock || {}
//     };

//     const updatedProduct = await Product.findByIdAndUpdate(id, { $set: setFields }, { new: true });
//     res.json({ success: true, updatedProduct });

//   } catch (err) {
//     console.error("Error in updateProductDetails:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// version 1.2 manage multiStore
const updateProductDetails = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });

    const role = req.user?.role;
    const franchiseId = req.user?.franchiseId?.toString() || null;
    const fields = req.fields || req.body || {};

    console.log("role", role, "franchiseId", franchiseId);

    // ── STOREMANAGER / INVENTORYSTAFF: only update their franchiseInventory ──
    if (role === "StoreManager" || role === "InventoryStaff") {
      if (!franchiseId)
        return res
          .status(400)
          .json({ error: "No franchise assigned to your account" });

      const invIndex = existingProduct.franchiseInventories.findIndex(
        (fi) => fi.franchiseId.toString() === franchiseId,
      );
      if (invIndex === -1)
        return res.status(404).json({
          error:
            "Product not assigned to your store. Ask Admin to sync it first.",
        });

      const inv = JSON.parse(
        JSON.stringify(
          existingProduct.franchiseInventories[invIndex].toObject(),
        ),
      );

      // ── InventoryStaff — stock only ───────────────────────────────────────────
      if (role === "InventoryStaff") {
        if (fields.countInStock !== undefined)
          inv.countInStock = Number(fields.countInStock);

        let variantsRaw = fields.variants;
        if (typeof variantsRaw === "string") {
          try {
            variantsRaw = JSON.parse(variantsRaw);
          } catch {
            variantsRaw = [];
          }
        }

        if (Array.isArray(variantsRaw) && variantsRaw.length > 0) {
          if (existingProduct.productType === "ColorSize") {
            variantsRaw.forEach((incoming) => {
              const cv = inv.colorVariants.find(
                (c) => c._id.toString() === incoming._id?.toString(),
              );
              if (cv && Array.isArray(incoming.sizes)) {
                incoming.sizes.forEach((inSize) => {
                  const s = cv.sizes.find(
                    (sz) => sz._id.toString() === inSize._id?.toString(),
                  );
                  if (s && inSize.countInStock !== undefined)
                    s.countInStock = Number(inSize.countInStock);
                });
              }
            });
          } else if (existingProduct.productType === "WeightPack") {
            variantsRaw.forEach((incoming) => {
              const v = inv.flatVariants.find(
                (fv) => fv._id.toString() === incoming._id?.toString(),
              );
              if (v && incoming.countInStock !== undefined)
                v.countInStock = Number(incoming.countInStock);
            });
          }
        }
      }

      // ── StoreManager — full inventory update ──────────────────────────────────
      if (role === "StoreManager") {
        if (fields.countInStock !== undefined)
          inv.countInStock = Number(fields.countInStock);
        if (fields.mrp !== undefined) inv.mrp = Number(fields.mrp);
        if (fields.offerPrice !== undefined)
          inv.offerPrice = Number(fields.offerPrice);
        if (fields.isEnable !== undefined)
          inv.isEnable = fields.isEnable === "true" || fields.isEnable === true;
        if (fields.minQuantity !== undefined)
          inv.minOrderQuantity = Number(fields.minQuantity);
        if (fields.maxQuantity !== undefined)
          inv.maxOrderQuantity = Number(fields.maxQuantity);
        if (fields.lowStockThreshold !== undefined)
          inv.lowStockThreshold = Number(fields.lowStockThreshold);

        let variantsRaw = fields.variants;
        if (typeof variantsRaw === "string") {
          try {
            variantsRaw = JSON.parse(variantsRaw);
          } catch {
            variantsRaw = [];
          }
        }

        if (Array.isArray(variantsRaw) && variantsRaw.length > 0) {
          if (existingProduct.productType === "ColorSize") {
            variantsRaw.forEach((incoming) => {
              const cv = inv.colorVariants.find(
                (c) => c._id.toString() === incoming._id?.toString(),
              );
              if (cv && Array.isArray(incoming.sizes)) {
                incoming.sizes.forEach((inSize) => {
                  const s = cv.sizes.find(
                    (sz) => sz._id.toString() === inSize._id?.toString(),
                  );
                  if (s) {
                    if (inSize.countInStock !== undefined)
                      s.countInStock = Number(inSize.countInStock);
                    if (inSize.offerPrice !== undefined)
                      s.offerPrice = Number(inSize.offerPrice);
                    if (inSize.mrp !== undefined) s.mrp = Number(inSize.mrp);
                  }
                });
              }
            });
          } else if (existingProduct.productType === "WeightPack") {
            variantsRaw.forEach((incoming) => {
              const v = inv.flatVariants.find(
                (fv) => fv._id.toString() === incoming._id?.toString(),
              );
              if (v) {
                if (incoming.countInStock !== undefined)
                  v.countInStock = Number(incoming.countInStock);
                if (incoming.offerPrice !== undefined)
                  v.offerPrice = Number(incoming.offerPrice);
                if (incoming.mrp !== undefined) v.mrp = Number(incoming.mrp);
              }
            });
          }
        }
      }

      existingProduct.franchiseInventories[invIndex] = inv;
      existingProduct.markModified("franchiseInventories");

      // Save old inventory before updating
      const oldInventory = JSON.parse(
        JSON.stringify(existingProduct.franchiseInventories[invIndex]),
      );

      existingProduct.franchiseInventories[invIndex] = inv;
      existingProduct.markModified("franchiseInventories");

      await existingProduct.save();

      try {
        const updatedInventory = existingProduct.franchiseInventories[invIndex];

        // WeightPack variants
        if (existingProduct.productType === "WeightPack") {
          for (const oldVariant of oldInventory.flatVariants || []) {
            const newVariant = updatedInventory.flatVariants?.find(
              (v) => v._id.toString() === oldVariant._id.toString(),
            );

            if (
              oldVariant.countInStock <= 0 &&
              newVariant &&
              newVariant.countInStock > 0
            ) {
              await notifyBackInStockUsers({
                product: existingProduct,
                variantId: newVariant._id,
                franchiseId,
                triggeredBy: req.user?._id,
              });
            }
          }
        }

        // ColorSize variants
        if (existingProduct.productType === "ColorSize") {
          for (const oldColor of oldInventory.colorVariants || []) {
            const newColor = updatedInventory.colorVariants?.find(
              (c) => c._id.toString() === oldColor._id.toString(),
            );

            if (!newColor) continue;

            for (const oldSize of oldColor.sizes || []) {
              const newSize = newColor.sizes?.find(
                (s) => s._id.toString() === oldSize._id.toString(),
              );

              if (
                oldSize.countInStock <= 0 &&
                newSize &&
                newSize.countInStock > 0
              ) {
                await notifyBackInStockUsers({
                  product: existingProduct,
                  variantId: newSize._id,
                  franchiseId,
                  triggeredBy: req.user?._id,
                });
              }
            }
          }
        }

        // Simple product
        if (
          oldInventory.countInStock <= 0 &&
          updatedInventory.countInStock > 0
        ) {
          await notifyBackInStockUsers({
            product: existingProduct,
            franchiseId,
            triggeredBy: req.user?._id,
          });
        }
      } catch (notificationError) {
        console.error(
          "Franchise back-in-stock notification failed:",
          notificationError,
        );
      }

      return res.json({
        success: true,
        message:
          role === "InventoryStaff"
            ? "Stock updated"
            : "Store inventory updated",
        data: existingProduct.franchiseInventories[invIndex],
      });
    }

    // ── ADMIN: full master product update (your existing logic below) ────────

    // Images handling
    let updatedImages = existingProduct.images || [];
    let newImageUrls = Array.isArray(fields.images)
      ? fields.images
      : fields.images
        ? JSON.parse(fields.images)
        : [];
    let removedImages = Array.isArray(fields.removedImages)
      ? fields.removedImages
      : fields.removedImages
        ? JSON.parse(fields.removedImages)
        : [];
    if (removedImages.length)
      updatedImages = updatedImages.filter(
        (img) => !removedImages.includes(img),
      );
    if (newImageUrls.length)
      updatedImages = [...updatedImages, ...newImageUrls];
    updatedImages = [...new Set(updatedImages)];

    const updatedCoupons = fields.coupons
      ? typeof fields.coupons === "string"
        ? JSON.parse(fields.coupons)
        : fields.coupons
      : existingProduct.coupons || [];

    const updatedTags =
      fields.tags !== undefined
        ? typeof fields.tags === "string"
          ? JSON.parse(fields.tags)
          : fields.tags
        : existingProduct.tags || [];

    const updatedKeywords =
      fields.keywords !== undefined
        ? typeof fields.keywords === "string"
          ? JSON.parse(fields.keywords)
          : fields.keywords
        : existingProduct.keywords || [];

    let color = existingProduct.color || { name: "", code: "" };
    if (fields.color)
      color =
        typeof fields.color === "string"
          ? JSON.parse(fields.color)
          : fields.color;
    color.name =
      color.name !== undefined ? color.name : existingProduct.color?.name || "";
    color.code = color.code || existingProduct.color?.code || "";

    let size =
      fields.size !== undefined
        ? typeof fields.size === "string"
          ? fields.size
          : fields.size.value || fields.size
        : existingProduct.size || "";

    const attributes = [];
    for (const key in fields) {
      const match = key.match(/attributes\[(\d+)\]\[(.+)\]/);
      if (match) {
        const index = match[1];
        const field = match[2];
        if (!attributes[index]) attributes[index] = {};
        attributes[index][field] = fields[key];
      }
    }
    const cleanedAttributes = attributes.filter(
      (attr) => attr.key?.trim() || attr.value?.trim(),
    );

    let variantsRaw = Array.isArray(fields.variants)
      ? fields.variants
      : fields.variants
        ? JSON.parse(fields.variants)
        : [];
    let colorVariants = existingProduct.colorVariants || [];
    let flatVariants = existingProduct.flatVariants || [];

    if (variantsRaw.length > 0) {
      const { productType } = fields;
      if (productType === "ColorSize") {
        colorVariants = variantsRaw.map((v, index) => {
          const existing = existingProduct.colorVariants?.[index] || {};
          return {
            _id: existing._id,
            name: v.name ?? existing.name ?? "",
            code: v.code ?? existing.code ?? "",
            images: Array.isArray(v.images) ? v.images : existing.images || [],
            sizes: Array.isArray(v.sizes)
              ? v.sizes.map((s, sIndex) => {
                  const existingSize = existing.sizes?.[sIndex] || {};
                  return {
                    _id: existingSize._id,
                    size: s.size ?? existingSize.size ?? "",
                    mrp: s.mrp ?? existingSize.mrp ?? 0,
                    offerPrice: s.offerPrice ?? existingSize.offerPrice ?? 0,
                    countInStock:
                      s.countInStock ?? existingSize.countInStock ?? 0,
                    sku: s.sku ?? existingSize.sku ?? "",
                    barcode: s.barcode ?? existingSize.barcode ?? "", // Preserve barcode if exists
                    minOrderQuantity:
                      s.minOrderQuantity ?? existingSize.minOrderQuantity ?? 1,
                    maxOrderQuantity:
                      s.maxOrderQuantity ??
                      existingSize.maxOrderQuantity ??
                      null,
                    variantStockThreshold:
                      s.variantStockThreshold ??
                      existingSize.variantStockThreshold ??
                      5,
                  };
                })
              : existing.sizes || [],
          };
        });
      } else if (productType === "WeightPack") {
        flatVariants = variantsRaw.map((v, index) => {
          const existing = existingProduct.flatVariants?.[index] || {};
          return {
            _id: existing._id,
            size: v.size ?? existing.size ?? null,
            mrp: v.mrp ?? existing.mrp ?? 0,
            offerPrice: v.offerPrice ?? existing.offerPrice ?? 0,
            images: Array.isArray(v.images) ? v.images : existing.images || [],
            countInStock: v.countInStock ?? existing.countInStock ?? 0,
            sku: v.sku ?? existing.sku ?? "",
            barcode: v.barcode ?? existing.barcode ?? "", // Preserve barcode if exists
            minOrderQuantity:
              v.minOrderQuantity ?? existing.minOrderQuantity ?? 1,
            maxOrderQuantity:
              v.maxOrderQuantity ?? existing.maxOrderQuantity ?? null,
            variantStockThreshold:
              v.variantStockThreshold ?? existing.variantStockThreshold ?? 5,
          };
        });
      }
    }

    flatVariants =
      flatVariants.length > 0
        ? flatVariants
        : JSON.parse(JSON.stringify(existingProduct.flatVariants || []));
    colorVariants =
      colorVariants.length > 0
        ? colorVariants
        : JSON.parse(JSON.stringify(existingProduct.colorVariants || []));

    const {
      name,
      description,
      mrp,
      offerPrice,
      category,
      subCategory,
      rating,
      segment,
      brand,
      countInStock,
      specification,
      aboutTheBrand,
      lowStockThreshold,
      createdBy,
      tax,
      returnable,
      returnWindow,
      warrantyPeriod,
      isFeatured,
      isBestSeller,
      visibility,
      minQuantity,
      maxQuantity,
      productType,
      outOfStock,
    } = fields;

    const setFields = {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      mrp: Number(mrp) || existingProduct.mrp,
      offerPrice: Number(offerPrice) || existingProduct.offerPrice,
      category,
      subCategory:
        subCategory === ""
          ? null
          : mongoose.Types.ObjectId.isValid(subCategory)
            ? subCategory
            : existingProduct.subCategory,
      segment:
        segment === ""
          ? null
          : mongoose.Types.ObjectId.isValid(segment)
            ? segment
            : existingProduct.segment,
      brand:
        brand === ""
          ? null
          : mongoose.Types.ObjectId.isValid(brand)
            ? brand
            : existingProduct.brand,
      images: updatedImages,
      coupons: updatedCoupons,
      aboutTheBrand:
        fields.aboutTheBrand !== undefined
          ? fields.aboutTheBrand
          : existingProduct.aboutTheBrand,
      specification:
        fields.specification !== undefined
          ? fields.specification
          : existingProduct.specification,
      lowStockThreshold:
        Number(lowStockThreshold) || existingProduct.lowStockThreshold,
      createdBy,
      rating: Number(rating) || existingProduct.rating,
      tax: Number(tax) || existingProduct.tax,
      returnable:
        returnable !== undefined
          ? Boolean(returnable)
          : existingProduct.returnable,
      returnWindow: Number(returnWindow) || existingProduct.returnWindow,
      warrantyPeriod: warrantyPeriod || existingProduct.warrantyPeriod,
      isFeatured:
        isFeatured !== undefined
          ? Boolean(isFeatured)
          : existingProduct.isFeatured,
      isBestSeller:
        isBestSeller !== undefined
          ? Boolean(isBestSeller)
          : existingProduct.isBestSeller,
      visibility: visibility || existingProduct.visibility,
      tags: updatedTags,
      keywords: updatedKeywords,
      color: color || null,
      size: size || null,
      attributes: cleanedAttributes,
      countInStock: Number(countInStock) || existingProduct.countInStock,
      flatVariants,
      colorVariants,
      outOfStock: Boolean(outOfStock) || existingProduct.outOfStock,
      minOrderQuantity: Number(minQuantity) || existingProduct.minOrderQuantity,
      maxOrderQuantity: Number(maxQuantity) || existingProduct.maxOrderQuantity,
      productType,
      hasVariants: flatVariants.length > 0 || colorVariants.length > 0,
      isEnable:
        fields.isEnable === "true" ||
        fields.isEnable === true ||
        existingProduct.isEnable,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, setFields, {
      new: true,
    });

    await notifyBackInStock(existingProduct, updatedProduct, req);

    // ✅ ADDED — sync variant removals to all franchise inventories
    // When admin removes a colorVariant or flatVariant from master,
    // remove it from every store's inventory too

    if (updatedProduct.franchiseInventories?.length > 0) {
      let inventoryModified = false;

      updatedProduct.franchiseInventories.forEach((inv) => {
        // ── ColorSize ─────────────────────────────────────────────────────────
        if (updatedProduct.productType === "ColorSize") {
          // ✅ Remove color variants no longer in master
          const masterColorIds = updatedProduct.colorVariants.map((cv) =>
            cv._id.toString(),
          );
          const beforeColorCount = inv.colorVariants.length;
          inv.colorVariants = inv.colorVariants.filter((sc) =>
            masterColorIds.includes(sc._id.toString()),
          );
          if (inv.colorVariants.length !== beforeColorCount)
            inventoryModified = true;

          // ✅ Remove sizes no longer in master (per color)
          updatedProduct.colorVariants.forEach((masterColor) => {
            const storeColor = inv.colorVariants.find(
              (sc) => sc._id.toString() === masterColor._id.toString(),
            );
            if (storeColor) {
              const masterSizeIds = masterColor.sizes.map((s) =>
                s._id.toString(),
              );
              const beforeSizeCount = storeColor.sizes.length;
              storeColor.sizes = storeColor.sizes.filter((ss) =>
                masterSizeIds.includes(ss._id.toString()),
              );
              if (storeColor.sizes.length !== beforeSizeCount)
                inventoryModified = true;
            }
          });

          // ✅ Add new color variants / sizes not yet in store (countInStock = 0)
          updatedProduct.colorVariants.forEach((masterColor) => {
            const storeColor = inv.colorVariants.find(
              (sc) => sc._id.toString() === masterColor._id.toString(),
            );
            if (!storeColor) {
              inv.colorVariants.push({
                ...JSON.parse(
                  JSON.stringify(
                    masterColor.toObject ? masterColor.toObject() : masterColor,
                  ),
                ),
                sizes: masterColor.sizes.map((s) => ({
                  ...JSON.parse(JSON.stringify(s.toObject ? s.toObject() : s)),
                  countInStock: 0,
                })),
              });
              inventoryModified = true;
            } else {
              masterColor.sizes.forEach((masterSize) => {
                const storeSize = storeColor.sizes.find(
                  (ss) => ss._id.toString() === masterSize._id.toString(),
                );
                if (!storeSize) {
                  storeColor.sizes.push({
                    ...JSON.parse(
                      JSON.stringify(
                        masterSize.toObject
                          ? masterSize.toObject()
                          : masterSize,
                      ),
                    ),
                    countInStock: 0,
                  });
                  inventoryModified = true;
                }
              });
            }
          });
        }

        // ── WeightPack ────────────────────────────────────────────────────────
        if (updatedProduct.productType === "WeightPack") {
          // ✅ Remove flat variants no longer in master
          const masterVariantIds = updatedProduct.flatVariants.map((v) =>
            v._id.toString(),
          );
          const beforeCount = inv.flatVariants.length;
          inv.flatVariants = inv.flatVariants.filter((sv) =>
            masterVariantIds.includes(sv._id.toString()),
          );
          if (inv.flatVariants.length !== beforeCount) inventoryModified = true;

          // ✅ Add new flat variants not yet in store (countInStock = 0)
          updatedProduct.flatVariants.forEach((masterVariant) => {
            const existsInStore = inv.flatVariants.find(
              (sv) => sv._id.toString() === masterVariant._id.toString(),
            );
            if (!existsInStore) {
              inv.flatVariants.push({
                ...JSON.parse(
                  JSON.stringify(
                    masterVariant.toObject
                      ? masterVariant.toObject()
                      : masterVariant,
                  ),
                ),
                countInStock: 0,
              });
              inventoryModified = true;
            }
          });
        }
      });

      if (inventoryModified) {
        updatedProduct.markModified("franchiseInventories");
        await updatedProduct.save();
      }
    }
    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Error in updateProductDetails:", err);
    res.status(500).json({ error: err.message });
  }
});

//  Delete product version 1.0
// const deleteProductById = asyncHandler(async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     // req.app.get("io").emit("productDeleted", product);

//     res.json({
//       success: true,
//       message: "Product Deleted Successfully.",
//       product,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

const notifyBackInStock = async (existingProduct, updatedProduct, req) => {
  const wasOutOfStock =
    existingProduct.countInStock <= 0 && existingProduct.outOfStock === true;

  const isNowInStock =
    updatedProduct.countInStock > 0 ||
    updatedProduct.flatVariants?.some((v) => v.countInStock > 0) ||
    updatedProduct.colorVariants?.some((color) =>
      color.sizes?.some((size) => size.countInStock > 0),
    );

  if (!wasOutOfStock || !isNowInStock) return;

  const subscribers = await stockNotificationSchema
    .find({
      productId: updatedProduct._id,
      notified: false,
    })
    .populate("userId", "fcmToken username");

  for (const sub of subscribers) {
    const messageText = `${updatedProduct.name} is now back in stock.`;

    await createNotification({
      userId: sub.userId._id,
      title: "Product Back In Stock",
      message: messageText,
      type: "Back-In-Stock",
      triggeredBy: req.user?._id || null,
      referenceId: updatedProduct._id,
      referenceModel: "Product",
    });

    await sendToUser(sub.userId._id, "productBackInStock", {
      message: messageText,
      product: updatedProduct,
    });

    if (sub.userId?.fcmToken) {
      try {
        await admin.messaging().send({
          token: sub.userId.fcmToken,
          notification: {
            title: "Product Back In Stock",
            body: messageText,
          },
          data: {
            type: "Back-In-Stock",
            productId: updatedProduct._id.toString(),
          },
        });
      } catch (err) {
        console.error(`FCM failed for user ${sub.userId._id}:`, err.message);
      }
    }
  }

  await stockNotificationSchema.updateMany(
    {
      productId: updatedProduct._id,
      notified: false,
    },
    {
      $set: {
        notified: true,
      },
    },
  );
};

// Delete Segment version 1.1 with ref check then delete if ref not existed in any model
const deleteProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if this product is referenced anywhere
    const references = await checkModelReferences("Product", id, {
      sampleLimit: 5,
    });

    if (Object.keys(references).length > 0) {
      const refSummary = Object.entries(references)
        .map(([model, info]) => {
          const examples = info.samples.map((s) => s.name).join(", ") || "N/A";
          return `${info.count} ${model}(s) (fields: ${info.fields.join(", ")}; examples: ${examples})`;
        })
        .join("; ");

      return res.status(400).json({
        success: false,
        message: `You cannot delete this product because it is referenced in: ${refSummary}.`,
        references,
      });
    }

    // Safe to delete
    const removed = await Product.findByIdAndDelete(id);

    // Optionally emit via socket
    // req.app.get("io").emit("productDeleted", removed);

    return res.json({
      success: true,
      message: "Product deleted successfully.",
      deleted: removed,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword }).limit(pageSize);

    res.json({
      products,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

//single store
// const fetchProductById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   // Validate MongoDB ObjectId
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Invalid product ID" });
//   }

//   try {
//     const product = await Product.findById(id)
//       .populate("brand", "name")
//       .populate("coupons");

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({
//       status: true,
//       message: "Product fetched successfully",
//       product,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

//single-Store
// const fetchAllProducts = asyncHandler(async (req, res) => {
//   try {
//     let { page, limit, search, brand, category, subCategory, segment } = req.query;

//     // Build dynamic search query
//     const searchQuery = { isAvailable: true };

//     if (search) {
//       searchQuery.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Filter by query params only if provided
//     if (brand) searchQuery.brand = brand;
//     if (category) searchQuery.category = category;
//     if (subCategory) searchQuery.subCategory = subCategory;
//     if (segment) searchQuery.segment = segment;

//     // Base query
//     let query = Product.find(searchQuery)
//       .populate("brand")
//       .populate("category")
//       .populate("subCategory")
//       .populate("segment")
//       .populate("createdBy", "_id username role city")
//       .sort({ createdAt: -1 });

//     let pagination = null;

//     // Apply pagination only if page & limit are provided
//     if (page && limit) {
//       page = parseInt(page);
//       limit = parseInt(limit);
//       const skip = (page - 1) * limit;

//       query = query.skip(skip).limit(limit);

//       const totalProducts = await Product.countDocuments(searchQuery);

//       pagination = {
//         currentPage: page,
//         totalPages: Math.ceil(totalProducts / limit),
//         totalProducts,
//       };
//     }

//     const products = await query;
//     const filteredProducts = products.filter((p) => p.category !== null);

//     res.json({
//       success: true,
//       data: filteredProducts,
//       pagination, // null if not paginated
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error", message: error.message });
//   }
// });

//multiStore
const fetchProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid product ID" });

  try {
    const product = await Product.findById(id)
      .populate("brand", "name")
      .populate("coupons")
      .lean();

    if (!product) return res.status(404).json({ message: "Product not found" });

    const { franchiseId: queryFranchiseId } = req.query;
    const role = req.user?.role;

    const effectiveFranchiseId =
      role === "StoreManager"
        ? req.user?.franchiseId?.toString()
        : queryFranchiseId || req.user?.franchiseId?.toString() || null;

    if (
      queryFranchiseId &&
      !mongoose.Types.ObjectId.isValid(queryFranchiseId)
    ) {
      return res.status(400).json({ message: "Invalid franchise ID" });
    }

    // Admin without franchiseId — return full master data
    if (!effectiveFranchiseId) {
      return res.status(200).json({ success: true, product });
    }

    // StoreManager / Admin with franchiseId — overlay store inventory
    const inv = product.franchiseInventories?.find(
      (fi) => fi.franchiseId.toString() === effectiveFranchiseId,
    );
    const productData = inv
      ? {
          ...product,
          mrp: inv.mrp,
          offerPrice: inv.offerPrice,
          countInStock: inv.countInStock,
          outOfStock: inv.outOfStock,
          isEnable: inv.isEnable,
          minOrderQuantity: inv.minOrderQuantity,
          maxOrderQuantity: inv.maxOrderQuantity,
          flatVariants: inv.flatVariants,
          colorVariants: inv.colorVariants,
          lowStockThreshold: inv.lowStockThreshold,
          franchiseInventory: inv,
          franchiseInventories: undefined,
        }
      : { ...product, franchiseInventories: undefined };

    res.status(200).json({ success: true, product: productData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// const fetchProductByIdByUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({
//       message: "Invalid product ID",
//     });
//   }

//   try {
//     const product = await Product.findById(id)
//       .populate("brand", "name")
//       .populate("coupons");

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

// let isSubscribedForStockAlert = false;

// if (req.user?._id) {
//   const subscription =
//     await stockNotificationSchema.findOne({
//       userId: req.user._id,
//       productId: product._id,
//       notified: false,
//     });

//   isSubscribedForStockAlert = !!subscription;
// }

//     res.status(200).json({
//       status: true,
//       message: "Product fetched successfully",
//       product,
//       isSubscribedForStockAlert,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

// multi-Store
const fetchProductByIdByUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid product ID" });

  try {
    const product = await Product.findById(id)
      .populate("brand", "name")
      .populate("coupons")
      .lean();

    if (!product) return res.status(404).json({ message: "Product not found" });

    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;

    console.log(franchiseId);

    // Overlay store inventory if franchiseId present
    let productData = product;
    console.log(product.franchiseInventories);
    if (franchiseId) {
      const inv = product.franchiseInventories?.find(
        (fi) => fi.franchiseId.toString() === franchiseId,
      );
      if (inv) {
        productData = {
          ...product,
          mrp: inv.mrp,
          offerPrice: inv.offerPrice,
          countInStock: inv.countInStock,
          outOfStock: inv.outOfStock,
          flatVariants: inv.flatVariants,
          colorVariants: inv.colorVariants,
          isEnable: inv.isEnable,
          minOrderQuantity: inv.minOrderQuantity,
          maxOrderQuantity: inv.maxOrderQuantity,
          lowStockThreshold: inv.lowStockThreshold,
          franchiseInventories: undefined,
        };
      }
    }

    let isSubscribedForStockAlert = false;
    if (req.user?._id) {
      const subscription = await stockNotificationSchema.findOne({
        userId: req.user._id,
        productId: product._id,
        notified: false,
      });
      isSubscribedForStockAlert = !!subscription;
    }

    res.status(200).json({
      success: true,
      product: productData,
      isSubscribedForStockAlert,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//multi-store
// const fetchAllProducts = asyncHandler(async (req, res) => {
//   try {
//     let { page, limit, search, brand, category, subCategory, segment } = req.query;

//     const role        = req.user?.role;
//     const franchiseId = req.user?.franchiseId?.toString()
//                      || req.query.franchiseId
//                      || null;
// console.log(franchiseId);
//     const searchQuery = { isAvailable: true };

//     if (search) {
//       searchQuery.$or = [
//         { name:        { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }
//     if (brand)       searchQuery.brand       = brand;
//     if (category)    searchQuery.category    = category;
//     if (subCategory) searchQuery.subCategory = subCategory;
//     if (segment)     searchQuery.segment     = segment;

//     // Customer — only show products enabled + in stock in their store
//     if (role === "Customer" && franchiseId) {
//       searchQuery.franchiseInventories = {
//         $elemMatch: {
//           franchiseId: new mongoose.Types.ObjectId(franchiseId),
//           isEnable:    true,
//           outOfStock:  false,
//         },
//       };
//       searchQuery.visibility = "Public";
//     }

//     let query = Product.find(searchQuery)
//       .populate("brand").populate("category")
//       .populate("subCategory").populate("segment")
//       .populate("createdBy", "_id username role city")
//       .sort({ createdAt: -1 });

//     let pagination = null;
//     if (page && limit) {
//       page  = parseInt(page);
//       limit = parseInt(limit);
//       const skip = (page - 1) * limit;
//       query = query.skip(skip).limit(limit);
//       const totalProducts = await Product.countDocuments(searchQuery);
//       pagination = { currentPage: page, totalPages: Math.ceil(totalProducts / limit), totalProducts };
//     }

//     const products = await query.lean();
//     const filteredProducts = products.filter((p) => p.category !== null);

//     // Overlay store inventory for Customer and StoreManager
//     const data = franchiseId
//       ? filteredProducts.map((p) => {
//           const inv = p.franchiseInventories?.find(
//             (fi) => fi.franchiseId.toString() === franchiseId
//           );
//           if (!inv) return { ...p, franchiseInventories: undefined };
//           return {
//             ...p,
//             mrp:               inv.mrp,
//             offerPrice:        inv.offerPrice,
//             countInStock:      inv.countInStock,
//             outOfStock:        inv.outOfStock,
//             isEnable:          inv.isEnable,
//             minOrderQuantity:  inv.minOrderQuantity,
//             maxOrderQuantity:  inv.maxOrderQuantity,
//             flatVariants:      inv.flatVariants,
//             colorVariants:     inv.colorVariants,
//             franchiseInventory: inv,
//             franchiseInventories: undefined,
//           };
//         })
//       : filteredProducts;

//     res.json({ success: true, data, pagination });
//   } catch (error) {
//     res.status(500).json({ error: "Server Error", message: error.message });
//   }
// });

// ── Add this near the top of productController.js ────────────────────────────
// Reuse in fetchAllProducts, fetchAllProductsByAdmin, productSearch, etc.
const overlayInventory = (products, franchiseId) => {
  if (!franchiseId) return products;
  return products.map((p) => {
    const inv = p.franchiseInventories?.find(
      (fi) => fi.franchiseId.toString() === franchiseId,
    );
    if (!inv) return { ...p, franchiseInventories: undefined };
    return {
      ...p,
      mrp: inv.mrp,
      offerPrice: inv.offerPrice,
      countInStock: inv.countInStock,
      outOfStock: inv.outOfStock,
      isEnable: inv.isEnable,
      minOrderQuantity: inv.minOrderQuantity,
      maxOrderQuantity: inv.maxOrderQuantity,
      flatVariants: inv.flatVariants,
      colorVariants: inv.colorVariants,
      lowStockThreshold: inv.lowStockThreshold,
      franchiseInventory: inv,
      franchiseInventories: undefined,
    };
  });
};
const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    let { page, limit, search, brand, category, subCategory, segment } =
      req.query;

    const role = req.user?.role;

    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;

    console.log("franchiseId:", franchiseId, "role:", role);

    const searchQuery = { isAvailable: true };

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");

      searchQuery.$or = [
        // Product name
        { name: searchRegex },

        // Description
        { description: searchRegex },

        // Tags
        { tags: { $in: [searchRegex] } },

        // Keywords
        { keywords: { $in: [searchRegex] } },

        // Product size
        { size: searchRegex },

        // WeightPack variant size
        { "flatVariants.size": searchRegex },

        // ColorSize variant size
        { "colorVariants.sizes.size": searchRegex },

        // Optional SKU search
        { "flatVariants.sku": searchRegex },
        { "colorVariants.sizes.sku": searchRegex },
      ];
    }

    if (brand) searchQuery.brand = brand;
    if (category) searchQuery.category = category;
    if (subCategory) searchQuery.subCategory = subCategory;
    if (segment) searchQuery.segment = segment;

    // A franchise user must never see the master catalog. Store staff see all
    // products assigned to their own franchise (including zero stock) while
    // customers see only enabled, sellable stock.
    if (franchiseId && ["StoreManager", "InventoryStaff"].includes(role)) {
      searchQuery.franchiseInventories = {
        $elemMatch: { franchiseId: new mongoose.Types.ObjectId(franchiseId) },
      };
    } else if (franchiseId && role !== "Admin") {
      searchQuery.franchiseInventories = {
        $elemMatch: {
          franchiseId: new mongoose.Types.ObjectId(franchiseId),
          isEnable: true,
          outOfStock: false,
        },
      };
      if (role !== "StoreManager" && role !== "Admin") {
        searchQuery.visibility = "Public";
      }
    }

    let query = Product.find(searchQuery)
      .populate("brand")
      .populate("category")
      .populate("subCategory")
      .populate("segment")
      .populate("createdBy", "_id username role city")
      .sort({ createdAt: -1 });

    let pagination = null;
    if (page && limit) {
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
      const totalProducts = await Product.countDocuments(searchQuery);
      pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      };
    }

    const products = await query.lean();
    const data = overlayInventory(products, franchiseId);

    // Keep both names during the frontend transition.
    res.json({ success: true, data, products: data, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
}); // const fetchAllProductsByAdmin = asyncHandler(async (req, res) => {
//   try {
//     let { page, limit, search, brand, category, subCategory, segment, isAvailable } = req.query;

//     const searchQuery = {};

//     if (search) {
//       const lower = search.toLowerCase();
//       searchQuery.$or = [
//         { name: { $regex: lower, $options: "i" } },
//         { description: { $regex: lower, $options: "i" } },
//       ];
//     }

//     // Filters
//     if (brand) searchQuery.brand = brand;
//     if (category) searchQuery.category = category;
//     if (subCategory) searchQuery.subCategory = subCategory;
//     if (segment) searchQuery.segment = segment;

//     // Filter by availability if provided
//     if (isAvailable === "true") searchQuery.isAvailable = true;
//     if (isAvailable === "false") searchQuery.isAvailable = false;

//     let query = Product.find(searchQuery)
//       .populate("brand")
//       .populate("category")
//       .populate("subCategory")
//       .populate("segment")
//       .populate("createdBy", "_id username role city")
//       .sort({ createdAt: -1 });

//     let pagination = null;
//     if (page && limit) {
//       page = parseInt(page);
//       limit = parseInt(limit);
//       const skip = (page - 1) * limit;
//       query = query.skip(skip).limit(limit);

//       const totalProducts = await Product.countDocuments(searchQuery);
//       pagination = {
//         currentPage: page,
//         totalPages: Math.ceil(totalProducts / limit),
//         totalProducts,
//       };
//     }

//     const products = await query;

// const productsWithParentStatus = products.map(p => {
//   let topUnavailableParent = null;

//   // Check Brand → Product hierarchy
//   if (p.brand && !p.brand.isAvailable) {
//     topUnavailableParent = p.brand.name;
//   } else {
//     // Check Category → SubCategory → Segment → Product hierarchy
//     if (p.category && !p.category.isAvailable) topUnavailableParent = p.category.name;
//     else if (p.subCategory && !p.subCategory.isAvailable) topUnavailableParent = p.subCategory.name;
//     else if (p.segment && !p.segment.isAvailable) topUnavailableParent = p.segment.name;
//   }

//   return {
//     ...p.toObject(),
//     parentUnavailable: !!topUnavailableParent,
//     topUnavailableParent, // null if none unavailable
//   };
// });

//     res.json({
//       success: true,
//       data: productsWithParentStatus,
//       pagination,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error", message: error.message });
//   }
// });

//1.2
// const fetchAllProductsByAdmin = asyncHandler(async (req, res) => {
//   try {
//     let { page, limit, search, brand, category, subCategory, segment, isAvailable } = req.query;

//     const searchQuery = {};

//     if (search) {
//       const lower = search.toLowerCase();
//       searchQuery.$or = [
//         { name: { $regex: lower, $options: "i" } },
//         { description: { $regex: lower, $options: "i" } },
//       ];
//     }

//     // Filters
//     if (brand) searchQuery.brand = brand;
//     if (category) searchQuery.category = category;
//     if (subCategory) searchQuery.subCategory = subCategory;
//     if (segment) searchQuery.segment = segment;

//     // Filter by availability if provided
//     if (isAvailable === "true") searchQuery.isAvailable = true;
//     if (isAvailable === "false") searchQuery.isAvailable = false;

//     // 🔥 StoreManager: Filter by THEIR franchise only
//     if (req.user.role === "StoreManager" && req.user.franchiseId) {
//       searchQuery['franchiseInventories.franchiseId'] = req.user.franchiseId;
//     }

//     let query = Product.find(searchQuery)
//       .populate("brand")
//       .populate("category")
//       .populate("subCategory")
//       .populate("segment")
//       .populate("createdBy", "_id username role city")
//       .sort({ createdAt: -1 });

//     let pagination = null;
//     if (page && limit) {
//       page = parseInt(page);
//       limit = parseInt(limit);
//       const skip = (page - 1) * limit;
//       query = query.skip(skip).limit(limit);

//       const totalProducts = await Product.countDocuments(searchQuery);
//       pagination = {
//         currentPage: page,
//         totalPages: Math.ceil(totalProducts / limit),
//         totalProducts,
//       };
//     }

//     const products = await query;

//     const productsWithParentStatus = products.map(p => {
//       let topUnavailableParent = null;

//       // Check Brand → Product hierarchy
//       if (p.brand && !p.brand.isAvailable) {
//         topUnavailableParent = p.brand.name;
//       } else {
//         // Check Category → SubCategory → Segment → Product hierarchy
//         if (p.category && !p.category.isAvailable) topUnavailableParent = p.category.name;
//         else if (p.subCategory && !p.subCategory.isAvailable) topUnavailableParent = p.subCategory.name;
//         else if (p.segment && !p.segment.isAvailable) topUnavailableParent = p.segment.name;
//       }

//       return {
//         ...p.toObject(),
//         parentUnavailable: !!topUnavailableParent,
//         topUnavailableParent, // null if none unavailable
//       };
//     });

//     // 🔥 StoreManager: Enrich with THEIR store inventory data
//     if (req.user.role === "StoreManager" && req.user.franchiseId) {
//       const enrichedProducts = productsWithParentStatus.map(product => {
//         const storeInv = product.franchiseInventories?.find(
//           inv => inv.franchiseId.toString() === req.user.franchiseId.toString()
//         );
//         return {
//           ...product,
//           storeInventory: storeInv || null,  // Their store's stock/price
//         };
//       });

//       res.json({
//         success: true,
//         data: enrichedProducts,
//         pagination,
//         userRole: req.user.role,
//         franchiseId: req.user.franchiseId, // Debug info
//       });
//       return;
//     }

//     // 🔥 ADMIN: Global data (original logic)
//     res.json({
//       success: true,
//       data: productsWithParentStatus,
//       pagination,
//       userRole: req.user.role,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error", message: error.message });
//   }
// });

//1.3
// const fetchAllProductsByAdmin = asyncHandler(async (req, res) => {
//   try {
//     let { page, limit, search, brand, category, subCategory, segment, isAvailable } = req.query;

//     const searchQuery = {};

//     if (search) {
//       const lower = search.toLowerCase();
//       searchQuery.$or = [
//         { name: { $regex: lower, $options: "i" } },
//         { description: { $regex: lower, $options: "i" } },
//       ];
//     }

//     // Filters (same for all roles)
//     if (brand) searchQuery.brand = brand;
//     if (category) searchQuery.category = category;
//     if (subCategory) searchQuery.subCategory = subCategory;
//     if (segment) searchQuery.segment = segment;

//     if (isAvailable === "true") searchQuery.isAvailable = true;
//     if (isAvailable === "false") searchQuery.isAvailable = false;

//     // 🔥 NO franchise filter - ALWAYS return ALL global products

//     let query = Product.find(searchQuery)
//       .populate("brand")
//       .populate("category")
//       .populate("subCategory")
//       .populate("segment")
//       .populate("createdBy", "_id username role city")
//       .sort({ createdAt: -1 });

//     let pagination = null;
//     if (page && limit) {
//       page = parseInt(page);
//       limit = parseInt(limit);
//       const skip = (page - 1) * limit;
//       query = query.skip(skip).limit(limit);

//       const totalProducts = await Product.countDocuments(searchQuery);
//       pagination = {
//         currentPage: page,
//         totalPages: Math.ceil(totalProducts / limit),
//         totalProducts,
//       };
//     }

//     const products = await query;

//     const productsWithParentStatus = products.map(p => {
//       let topUnavailableParent = null;

//       if (p.brand && !p.brand.isAvailable) {
//         topUnavailableParent = p.brand.name;
//       } else {
//         if (p.category && !p.category.isAvailable) topUnavailableParent = p.category.name;
//         else if (p.subCategory && !p.subCategory.isAvailable) topUnavailableParent = p.subCategory.name;
//         else if (p.segment && !p.segment.isAvailable) topUnavailableParent = p.segment.name;
//       }

//       return {
//         ...p.toObject(),
//         parentUnavailable: !!topUnavailableParent,
//         topUnavailableParent,
//       };
//     });

//     // 🔥 FRANCHISE USERS (StoreManager/Customer): Add THEIR store data to ALL products
//     if (req.franchiseId) {  // Works for both StoreManager & Customer with franchiseId
//       console.log('🔥 FRANCHISE MODE - Enriching ALL products with store data');

//       const enrichedProducts = productsWithParentStatus.map(product => {
//         // Find THIS user's store inventory for THIS product
//         const storeInv = product.franchiseInventories?.find(
//           inv => inv.franchiseId.toString() === req.franchiseId.toString()
//         );

//         return {
//           ...product,
//           storeInventory: storeInv || null,  // null if no store stock
//           // ✅ Optional: Override main fields with store data if exists
//           ...(storeInv && {
//             storeMrp: storeInv.mrp,
//             storeOfferPrice: storeInv.offerPrice,
//             storeStock: storeInv.countInStock,
//             storeVariants: storeInv.flatVariants
//           })
//         };
//       });

//       res.json({
//         success: true,
//         data: enrichedProducts,     // ✅ ALL products + store data where available
//         pagination,
//         userRole: req.user?.role || "Customer",
//         franchiseId: req.franchiseId,
//         totalProductsWithStoreData: enrichedProducts.filter(p => p.storeInventory).length
//       });
//       return;
//     }

//     // 🔥 ADMIN: Pure global data
//     res.json({
//       success: true,
//       data: productsWithParentStatus,
//       pagination,
//       userRole: req.user.role,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error", message: error.message });
//   }
// });

// version - 1.4
// const fetchAllProductsByAdmin = asyncHandler(async (req, res) => {
//   try {
//     let { page, limit, search, brand, category, subCategory, segment,
//           isAvailable, franchiseId: queryFranchiseId } = req.query;

//     const role = req.user?.role;

//     // StoreManager can only query their own franchise
//     const effectiveFranchiseId = role === "StoreManager"
//       ? req.user.franchiseId?.toString()
//       : queryFranchiseId || null;

//     const searchQuery = {};
//     if (search) {
//       searchQuery.$or = [
//         { name:        { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }
//     if (brand)       searchQuery.brand       = brand;
//     if (category)    searchQuery.category    = category;
//     if (subCategory) searchQuery.subCategory = subCategory;
//     if (segment)     searchQuery.segment     = segment;
//     if (isAvailable === "true")  searchQuery.isAvailable = true;
//     if (isAvailable === "false") searchQuery.isAvailable = false;

//     // Filter by franchise if context exists
//     if (effectiveFranchiseId) {
//       searchQuery["franchiseInventories.franchiseId"] =
//         new mongoose.Types.ObjectId(effectiveFranchiseId);
//     }

//     let query = Product.find(searchQuery)
//       .populate("brand").populate("category")
//       .populate("subCategory").populate("segment")
//       .populate("createdBy", "_id username role city")
//       .sort({ createdAt: -1 });

//     let pagination = null;
//     if (page && limit) {
//       page  = parseInt(page);
//       limit = parseInt(limit);
//       query = query.skip((page - 1) * limit).limit(limit);
//       const total = await Product.countDocuments(searchQuery);
//       pagination = { currentPage: page, totalPages: Math.ceil(total / limit), total };
//     }

//     const products = await query.lean();

//     const data = products.map((p) => {
//       // parentUnavailable check
//       let topUnavailableParent = null;
//       if (p.brand        && !p.brand.isAvailable)        topUnavailableParent = p.brand.name;
//       else if (p.category    && !p.category.isAvailable)    topUnavailableParent = p.category.name;
//       else if (p.subCategory && !p.subCategory.isAvailable) topUnavailableParent = p.subCategory.name;
//       else if (p.segment     && !p.segment.isAvailable)     topUnavailableParent = p.segment.name;

//       const base = { ...p, parentUnavailable: !!topUnavailableParent, topUnavailableParent };

//       // Overlay store inventory for StoreManager
//       if (effectiveFranchiseId) {
//         const inv = p.franchiseInventories?.find(
//           (fi) => fi.franchiseId.toString() === effectiveFranchiseId
//         );
//         return {
//           ...base,
//           mrp:               inv?.mrp          ?? p.mrp,
//           offerPrice:        inv?.offerPrice    ?? p.offerPrice,
//           countInStock:      inv?.countInStock  ?? p.countInStock,
//           outOfStock:        inv?.outOfStock    ?? p.outOfStock,
//           isEnable:          inv?.isEnable      ?? p.isEnable,
//           flatVariants:      inv?.flatVariants  ?? p.flatVariants,
//           colorVariants:     inv?.colorVariants ?? p.colorVariants,
//           franchiseInventory: inv || null,
//           franchiseInventories: undefined,
//         };
//       }

//       return base;
//     });

//     res.json({ success: true, data, pagination });
//   } catch (error) {
//     res.status(500).json({ error: "Server Error", message: error.message });
//   }
// });

const fetchAllProductsByAdmin = asyncHandler(async (req, res) => {
  try {
    let {
      page,
      limit,
      search,
      brand,
      category,
      subCategory,
      segment,
      isEnable,
      outOfStock,
      isAvailable,
      franchiseId: queryFranchiseId,
    } = req.query;

    const role = req.user?.role;

    const effectiveFranchiseId =
      role === "StoreManager"
        ? req.user.franchiseId?.toString()
        : queryFranchiseId || null;

    const searchQuery = {};
    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");

      searchQuery.$or = [
        // Product fields
        { name: searchRegex },
        { description: searchRegex },

        // SEO fields
        { tags: searchRegex },
        { keywords: searchRegex },

        // Weight/Pack variant sizes
        { "flatVariants.size": searchRegex },

        // Color variant name
        { "colorVariants.name": searchRegex },

        // Color variant size
        { "colorVariants.sizes.size": searchRegex },
      ];
    }
    if (brand) searchQuery.brand = brand;
    if (category) searchQuery.category = category;
    if (subCategory) searchQuery.subCategory = subCategory;
    if (segment) searchQuery.segment = segment;
    if (isAvailable === "true") searchQuery.isAvailable = true;
    if (isAvailable === "false") searchQuery.isAvailable = false;

    // ✅ FIXED — $elemMatch instead of dot notation
    if (effectiveFranchiseId) {
      // ✅ Build $elemMatch dynamically — only add fields that were actually passed
      const elemMatch = {
        franchiseId: new mongoose.Types.ObjectId(effectiveFranchiseId),
      };

      // ✅ Convert string → boolean only if provided
      if (isEnable === "true") elemMatch.isEnable = true;
      if (isEnable === "false") elemMatch.isEnable = false;
      if (outOfStock === "true") elemMatch.outOfStock = true;
      if (outOfStock === "false") elemMatch.outOfStock = false;

      searchQuery.franchiseInventories = { $elemMatch: elemMatch };
    } else {
      // ── Admin without franchiseId — filter master product fields ─────────────
      // isEnable and outOfStock apply to master product, not franchise inventory
      if (isEnable === "true") searchQuery.isEnable = true;
      if (isEnable === "false") searchQuery.isEnable = false;
      if (outOfStock === "true") searchQuery.outOfStock = true;
      if (outOfStock === "false") searchQuery.outOfStock = false;
    }

    let query = Product.find(searchQuery)
      .populate("brand")
      .populate("category")
      .populate("subCategory")
      .populate("segment")
      .populate("createdBy", "_id username role city")
      .sort({ createdAt: -1 });

    let pagination = null;
    if (page && limit) {
      page = parseInt(page);
      limit = parseInt(limit);
      query = query.skip((page - 1) * limit).limit(limit);
      const total = await Product.countDocuments(searchQuery);
      pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
      };
    }

    const products = await query.lean();

    const data = overlayInventory(products, effectiveFranchiseId);
    res.json({ success: true, data, pagination });
  } catch (error) {
    res.status(500).json({ error: "Server Error", message: error.message });
  }
});

//product-search  version - 1.1
// const productSearch = asyncHandler(async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query || query.trim().length < 2) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a valid search term.",
//       });
//     }

//     const trimmed = query.trim();

//     // Match Products
//     const products = await Product.find({
//       isAvailable: true,
//       $or: [
//         { name: { $regex: trimmed, $options: "i" } },
//         { description: { $regex: trimmed, $options: "i" } },
//         { keywords: { $in: [trimmed.toLowerCase()] } },
//       ],
//     })
//       .populate("category", "name")
//       .populate("brand", "name")
//       .populate("subCategory", "name")
//       .populate("segment", "name")
//       .limit(10);

//     // Match Categories
//     const categories = await categoryModel.find({
//       isAvailable: true,
//       $or: [
//         { name: { $regex: trimmed, $options: "i" } },
//         { keywords: { $in: [trimmed.toLowerCase()] } },
//       ],
//     })
//       .select("_id name image")
//       .limit(5);

//     // Match SubCategories
//     const subCategories = await subCategorySchema.find({
//       isAvailable: true,
//       $or: [
//         { name: { $regex: trimmed, $options: "i" } },
//         { keywords: { $in: [trimmed.toLowerCase()] } },
//       ],
//     })
//       .select("_id name image")
//       .limit(5);

//     // Match Segments
//     const segments = await segmentSchema.find({
//       isAvailable: true,
//       name: { $regex: trimmed, $options: "i" },
//     })
//       .select("_id name image")
//       .limit(5);

//     // Match Brands
//     const brands = await brand.find({
//       isAvailable: true,
//       name: { $regex: trimmed, $options: "i" },
//     })
//       .select("_id name image")
//       .limit(5);

//     // Response
//     res.json({
//       success: true,
//       brands,
//       categories,
//       subCategories,
//       segments,
//       products,
//     });
//   } catch (error) {
//     console.error("productSearch error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

//product-search  version - 1.2
const productSearch = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid search term.",
      });
    }

    const trimmed = query.trim();
    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;

    const regex = new RegExp(trimmed, "i");

    const searchWords = trimmed
      .split(/\s+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);

    const wordRegex = new RegExp(searchWords.join("|"), "i");

    // ---------------- PRODUCT QUERY ----------------

    const productQuery = {
      isAvailable: true,
      $or: [
        { name: regex },
        { description: regex },
        { size: regex },

        { tags: regex },
        { keywords: regex },

        { sku: regex }, // ⭐ NEW -> Search Product SKU
        { barcode: regex }, // ⭐ NEW -> Search Product Barcode

        { tags: wordRegex },
        { keywords: wordRegex },

        { "flatVariants.size": regex },
        { "flatVariants.sku": regex },
        { "flatVariants.barcode": regex }, // ⭐ NEW -> Search WeightPack Barcode

        { "colorVariants.name": regex },
        { "colorVariants.sizes.size": regex },
        { "colorVariants.sizes.sku": regex },
        { "colorVariants.sizes.barcode": regex }, // ⭐ NEW -> Search ColorSize Barcode
        
        // Location Search
        { "franchiseInventories.location.section": regex },
        { "franchiseInventories.location.rack": regex },
        { "franchiseInventories.location.bin": regex },
        { "franchiseInventories.flatVariants.location.section": regex },
        { "franchiseInventories.flatVariants.location.rack": regex },
        { "franchiseInventories.colorVariants.sizes.location.section": regex },
      ],
    };

    // Franchise filter
    if (franchiseId) {
      productQuery.franchiseInventories = {
        $elemMatch: {
          franchiseId: new mongoose.Types.ObjectId(franchiseId),
          isEnable: true,
          outOfStock: false,
        },
      };
    }

    // ---------------- FETCH DATA ----------------

    const [rawProducts, categories, subCategories, segments, brands] =
      await Promise.all([
        Product.find(productQuery)
          .populate("category", "name")
          .populate("brand", "name")
          .populate("subCategory", "name")
          .populate("segment", "name")
          .lean(),

        categoryModel
          .find({
            isAvailable: true,
            $or: [
              { name: regex },
              { tags: regex },
              { keywords: regex },
              { tags: wordRegex },
              { keywords: wordRegex },
            ],
          })
          .select("_id name image")
          .limit(5),

        subCategorySchema
          .find({
            isAvailable: true,
            $or: [
              { name: regex },
              { tags: regex },
              { keywords: regex },
              { tags: wordRegex },
              { keywords: wordRegex },
            ],
          })
          .select("_id name image")
          .limit(5),

        segmentSchema
          .find({
            isAvailable: true,
            $or: [
              { name: regex },
              { tags: regex },
              { keywords: regex },
              { tags: wordRegex },
              { keywords: wordRegex },
            ],
          })
          .select("_id name image")
          .limit(5),

        brand
          .find({
            isAvailable: true,
            $or: [
              { name: regex },
              { tags: regex },
              { keywords: regex },
              { tags: wordRegex },
              { keywords: wordRegex },
            ],
          })
          .select("_id name image")
          .limit(5),
      ]);

    // ---------------- INVENTORY OVERLAY ----------------

    const products = overlayInventory(rawProducts, franchiseId);

    // ---------------- SORT BY RELEVANCE ----------------

    products.sort((a, b) => {
      const getScore = (product) => {
        let score = 0;

        const name = (product.name || "").toLowerCase();
        const description = (product.description || "").toLowerCase();

        const tags = (product.tags || []).map((t) => t.toLowerCase());
        const keywords = (product.keywords || []).map((k) => k.toLowerCase());

        // ⭐ NEW -> Product level SKU
        const sku = (product.sku || "").toLowerCase();

        // ⭐ NEW -> Product level Barcode
        const barcode = (product.barcode || "").toLowerCase();

        searchWords.forEach((word) => {
          // Highest Priority - Name
          if (name === word) score += 1000;
          else if (name.startsWith(word)) score += 800;
          else if (name.includes(word)) score += 600;

          // ================= SKU =================

          // ⭐ NEW -> Exact SKU match
          if (sku === word) score += 900;
          // ⭐ NEW -> Partial SKU match
          else if (sku.includes(word)) score += 700;

          // ================= BARCODE =================

          // ⭐ NEW -> Barcode should get highest priority
          if (barcode === word) score += 1200;
          // ⭐ NEW -> Partial barcode
          else if (barcode.includes(word)) score += 1000;

          // Keyword
          if (keywords.includes(word)) score += 500;

          // Tags
          if (tags.includes(word)) score += 400;

          // Description
          if (description.includes(word)) score += 200;

          // ⭐ NEW -> Search inside WeightPack variants
          product.flatVariants?.forEach((variant) => {
            if (variant.barcode && variant.barcode.toLowerCase() === word) {
              score += 1200;
            }

            if (variant.sku && variant.sku.toLowerCase() === word) {
              score += 900;
            }
          });

          // ================= COLOR VARIANTS =================

          // ⭐ NEW -> Search inside Color Variant sizes
          product.colorVariants?.forEach((color) => {
            color.sizes?.forEach((size) => {
              if (size.barcode && size.barcode.toLowerCase() === word) {
                score += 1200;
              }

              if (size.sku && size.sku.toLowerCase() === word) {
                score += 900;
              }
            });
          });
        });

        return score;
      };

      return getScore(b) - getScore(a);
    });

    return res.json({
      success: true,
      franchiseId: franchiseId || null,
      brands,
      categories,
      subCategories,
      segments,
      products,
    });
  } catch (error) {
    console.error("productSearch error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .populate("subCategory")
      .populate("segment")
      .populate("brand")
      .populate("createdBy", "_id username role city")
      .sort({ createdAt: -1 }); // Fix typo: createAt -> createdAt
    // console.log(products.length)

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, error: "Server Error : " + error.message });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString(),
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("brand")
      .sort({ rating: -1 })
      .limit(4);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await Product.find(args).populate("brand", "name");
    // console.log(products,"product")
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// const updateStockCount = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const { countInStock, variantId } = req.body; // variantId is optional

//   // Validate countInStock
//   if (
//     countInStock === null ||
//     countInStock === undefined ||
//     isNaN(countInStock)
//   ) {
//     return res.status(400).json({
//       success: false,
//       error: "Invalid stock count",
//     });
//   }

//   try {
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: "Product not found",
//       });
//     }

//     // Check if it's a variant update
//     if (variantId) {
//       const variant = product.variants.id(variantId);

//       if (!variant) {
//         return res.status(404).json({
//           success: false,
//           error: "Variant not found",
//         });
//       }

//       variant.countInStock = Number(countInStock);
//     } else {
//       // Product-level stock update
//       product.countInStock = Number(countInStock);
//     }

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: variantId
//         ? "Variant stock count updated successfully"
//         : "Product stock count updated successfully",
//       product,
//     });
//   } catch (error) {
//     console.error("Stock update error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Server Error",
//     });
//   }
// });

// const getLowStockProducts = asyncHandler(async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const search = req.query.search || "";
//     let sortField = req.query.sortBy || "createdAt";
//     const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

//     if (sortField === "date") sortField = "createdAt";

//     const searchQuery = search
//       ? { name: { $regex: search, $options: "i" } }
//       : {};

//     const allProducts = await Product.find(
//       searchQuery,
//       "name countInStock lowStockThreshold variants images createdAt"
//     );

//     const finalProducts = [];

//     for (const product of allProducts) {
//       const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

//       if (hasVariants) {
//         const lowStockVariants = product.variants.filter(
//           (v) =>
//             typeof v.countInStock === "number" &&
//             typeof v.variantStockThreshold === "number" &&
//             v.countInStock <= v.variantStockThreshold
//         );

//         if (lowStockVariants.length > 0) {
//           finalProducts.push({
//             _id: product._id,
//             name: product.name,
//             variants: lowStockVariants,
//             createdAt: product.createdAt,
//             images: product.images,
//           });
//         }
//       } else {
//         if (
//           typeof product.countInStock === "number" &&
//           typeof product.lowStockThreshold === "number" &&
//           product.countInStock <= product.lowStockThreshold
//         ) {
//           finalProducts.push({
//             _id: product._id,
//             name: product.name,
//             countInStock: product.countInStock,
//             lowStockThreshold: product.lowStockThreshold,
//             images: product.images,
//             variants: [],
//             createdAt: product.createdAt,
//           });
//         }
//       }
//     }

//     // Apply in-memory sort
//     finalProducts.sort((a, b) => {
//       const aVal = a[sortField];
//       const bVal = b[sortField];

//       if (aVal < bVal) return -1 * sortOrder;
//       if (aVal > bVal) return 1 * sortOrder;
//       return 0;
//     });

//     // Pagination
//     const totalItems = finalProducts.length;
//     const totalPages = Math.ceil(totalItems / limit);
//     const paginatedProducts = finalProducts.slice(skip, skip + limit);

//     res.status(200).json({
//       success: true,
//       message: "Filtered low stock products and variants fetched successfully",
//       count: totalItems,
//       products: paginatedProducts,
//       pagination: {
//         totalItems,
//         totalPages,
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Failed to fetch low stock products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch low stock products",
//       error: error.message,
//     });
//   }
// });

// const updateStockCount = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const { countInStock, variantId } = req.body;

//   if (countInStock === null || countInStock === undefined || isNaN(countInStock)) {
//     return res.status(400).json({
//       success: false,
//       error: "Invalid stock count",
//     });
//   }

//   try {
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: "Product not found",
//       });
//     }

//     if (variantId) {
//       // Check for ColorSize variant
//       if (product.productType === "ColorSize") {
//         let found = false;
//         for (const color of product.colorVariants) {
//           const size = color.sizes.id(variantId);
//           if (size) {
//             size.countInStock = Number(countInStock);
//             found = true;
//             break;
//           }
//         }
//         if (!found) {
//           return res.status(404).json({ success: false, error: "Variant not found" });
//         }
//       }
//       //  Check for WeightPack variant
//       else if (product.productType === "WeightPack") {
//         const flatVariant = product.flatVariants.id(variantId);
//         if (!flatVariant) {
//           return res.status(404).json({ success: false, error: "Variant not found" });
//         }
//         flatVariant.countInStock = Number(countInStock);
//       }
//       else {
//         return res.status(400).json({ success: false, error: "This product has no variants" });
//       }
//     } else {
//       product.countInStock = Number(countInStock);
//     }

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: variantId
//         ? "Variant stock count updated successfully"
//         : "Product stock count updated successfully",
//       product,
//     });
//   } catch (error) {
//     console.error("Stock update error:", error);
//     res.status(500).json({ success: false, error: "Server Error" });
//   }
// });

//helper function for updateStockCount
const notifyBackInStockUsers = async ({
  product,
  variantId = null,
  franchiseId = null,
  triggeredBy = null,
}) => {
  const query = {
    productId: product._id,
    variantId,
    notified: false,
  };

  // Filter by franchise if provided
  if (franchiseId) {
    query.franchiseId = franchiseId;
  }

  const subscribers = await stockNotificationSchema
    .find(query)
    .populate("userId", "fcmToken username");

  for (const sub of subscribers) {
    const messageText = `${product.name} is now back in stock.`;

    // Create DB Notification
    const data = await createNotification({
      userId: sub.userId._id,
      title: "Product Back In Stock",
      message: messageText,
      type: "Back-In-Stock",
      triggeredBy,
      referenceId: product._id,
      referenceModel: "Product",
    });

    // Socket Notification
    await sendToUser(sub.userId._id, "productBackInStock", {
      message: messageText,
      product,
      franchiseId,
      variantId,
    });

    console.log("Notification created:", data);

    // Push Notification
    if (sub.userId?.fcmToken) {
      try {
        await admin.messaging().send({
          token: sub.userId.fcmToken,
          notification: {
            title: "Product Back In Stock",
            body: messageText,
          },
          data: {
            type: "Back-In-Stock",
            productId: product._id.toString(),
            franchiseId: franchiseId ? franchiseId.toString() : "",
            variantId: variantId ? variantId.toString() : "",
          },
        });
      } catch (err) {
        console.error(`FCM failed for user ${sub.userId._id}:`, err.message);
      }
    }
  }

  // Mark notifications as sent
  await stockNotificationSchema.updateMany(query, {
    $set: {
      notified: true,
    },
  });
};

// version - 1.1
// const updateStockCount = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const { countInStock, variantId } = req.body;

//   if (
//     countInStock === null ||
//     countInStock === undefined ||
//     isNaN(countInStock)
//   ) {
//     return res.status(400).json({
//       success: false,
//       error: "Invalid stock count",
//     });
//   }

//   try {
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: "Product not found",
//       });
//     }

//     // Track stock before update
//     const previousStock = product.countInStock;

//     if (variantId) {
//       // ColorSize Variant
//       if (product.productType === "ColorSize") {
//         let found = false;

//         for (const color of product.colorVariants) {
//           const size = color.sizes.id(variantId);

//           if (size) {
//             const previousVariantStock = size.countInStock;

//             size.countInStock = Number(countInStock);

//             // Variant back in stock
// if (
//   previousVariantStock <= 0 &&
//   Number(countInStock) > 0
// ) {
//   await notifyBackInStockUsers({
//     product,
//     variantId,
//     triggeredBy: req.user?._id,
//   });
// }

//             found = true;
//             break;
//           }
//         }

//         if (!found) {
//           return res.status(404).json({
//             success: false,
//             error: "Variant not found",
//           });
//         }
//       }

//       // WeightPack Variant
//       else if (product.productType === "WeightPack") {
//         const flatVariant = product.flatVariants.id(variantId);

//         if (!flatVariant) {
//           return res.status(404).json({
//             success: false,
//             error: "Variant not found",
//           });
//         }

//         const previousVariantStock = flatVariant.countInStock;

//         flatVariant.countInStock = Number(countInStock);

//         // Variant back in stock
// if (
//   previousVariantStock <= 0 &&
//   Number(countInStock) > 0
// ) {
//   await notifyBackInStockUsers({
//     product,
//     variantId,
//     triggeredBy: req.user?._id,
//   });
// }
//       } else {
//         return res.status(400).json({
//           success: false,
//           error: "This product has no variants",
//         });
//       }
//     } else {
//       product.countInStock = Number(countInStock);

//       // Main product back in stock
// if (
//   previousStock <= 0 &&
//   Number(countInStock) > 0
// ) {
//   await notifyBackInStockUsers({
//     product,
//     triggeredBy: req.user?._id,
//   });
// }
//     }

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: variantId
//         ? "Variant stock count updated successfully"
//         : "Product stock count updated successfully",
//       product,
//     });
//   } catch (error) {
//     console.error("Stock update error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Server Error",
//     });
//   }
// });

// version - 1.1
const updateStockCount = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { countInStock, variantId, location, franchiseId: bodyFranchiseId } = req.body;

  if (
    countInStock === null ||
    countInStock === undefined ||
    isNaN(countInStock)
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid stock count" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    const role = req.user?.role;
    const franchiseId =
      req.user?.franchiseId?.toString() || bodyFranchiseId?.toString() || null;

    // ── StoreManager / InventoryStaff: update franchise inventory only ────────
    if (franchiseId) {
      let inv = product.franchiseInventories.find(
        (fi) => fi.franchiseId.toString() === franchiseId,
      );
      // Admin can start inventory for an older franchise that predates the
      // automatic franchise inventory setup.
      if (!inv && role === "Admin") {
        product.franchiseInventories.push({
          franchiseId,
          mrp: product.mrp || 0,
          offerPrice: product.offerPrice || 0,
          minOrderQuantity: product.minOrderQuantity || 1,
          maxOrderQuantity: product.maxOrderQuantity,
          countInStock: 0,
          lowStockThreshold: product.lowStockThreshold || 10,
          outOfStock: true,
          isEnable: false,
          flatVariants: (product.flatVariants || []).map((variant) => variant.toObject()),
          colorVariants: (product.colorVariants || []).map((color) => color.toObject()),
        });
        inv = product.franchiseInventories[product.franchiseInventories.length - 1];
      }
      if (!inv)
        return res.status(404).json({
          success: false,
          error: "Product not assigned to your store",
        });

      const newQty = Number(countInStock);

      if (variantId) {
        // ── WeightPack ────────────────────────────────────────────────────────
        if (product.productType === "WeightPack") {
          const storeVariant = inv.flatVariants.find(
            (v) => v._id.toString() === variantId,
          );
          if (!storeVariant)
            return res.status(404).json({
              success: false,
              error: "Variant not found in your store",
            });

          const previousVariantStock = storeVariant.countInStock;
          storeVariant.countInStock = newQty;
          if (location) storeVariant.location = location;

          // back-in-stock notify
          if (previousVariantStock <= 0 && newQty > 0) {
            await notifyBackInStockUsers({
              product,
              variantId,
              triggeredBy: req.user?._id,
            });
          }

          // ── ColorSize ─────────────────────────────────────────────────────────
        } else if (product.productType === "ColorSize") {
          let found = false;
          for (const color of inv.colorVariants) {
            const size = color.sizes.find(
              (s) => s._id.toString() === variantId,
            );
            if (size) {
              const previousVariantStock = size.countInStock;
              size.countInStock = newQty;
              if (location) size.location = location;
              if (previousVariantStock <= 0 && newQty > 0) {
                await notifyBackInStockUsers({
                  product,
                  variantId,
                  triggeredBy: req.user?._id,
                });
              }
              found = true;
              break;
            }
          }
          if (!found)
            return res.status(404).json({
              success: false,
              error: "Variant not found in your store",
            });
        } else {
          return res
            .status(400)
            .json({ success: false, error: "This product has no variants" });
        }

        // outOfStock auto-calc for store
        if (product.productType === "WeightPack") {
          inv.outOfStock = inv.flatVariants.every(
            (v) => (v.countInStock || 0) === 0,
          );
        } else if (product.productType === "ColorSize") {
          inv.outOfStock = inv.colorVariants.every((cv) =>
            cv.sizes.every((s) => (s.countInStock || 0) === 0),
          );
        }
        inv.isEnable = !inv.outOfStock;
      } else {
        // ── Single product store stock ─────────────────────────────────────────
        const previousStock = inv.countInStock;
        inv.countInStock = newQty;
        if (location) inv.location = location;
        inv.outOfStock = newQty === 0;
        inv.isEnable = newQty > 0;

        if (previousStock <= 0 && newQty > 0) {
          await notifyBackInStockUsers({ product, triggeredBy: req.user?._id });
        }
      }

      await product.save();
      return res.status(200).json({
        success: true,
        message: variantId
          ? "Store variant stock updated"
          : "Store stock updated",
        storeInventory: product.franchiseInventories.find(
          (fi) => fi.franchiseId.toString() === franchiseId,
        ),
      });
    }

    // ── Admin: update master / warehouse stock ────────────────────────────────
    const previousStock = product.countInStock;

    if (variantId) {
      // ColorSize
      if (product.productType === "ColorSize") {
        let found = false;
        for (const color of product.colorVariants) {
          const size = color.sizes.id(variantId);
          if (size) {
            const previousVariantStock = size.countInStock;
            size.countInStock = Number(countInStock);
            if (location) size.location = location;
            if (previousVariantStock <= 0 && Number(countInStock) > 0) {
              await notifyBackInStockUsers({
                product,
                variantId,
                triggeredBy: req.user?._id,
              });
            }
            found = true;
            break;
          }
        }
        if (!found)
          return res
            .status(404)
            .json({ success: false, error: "Variant not found" });

        // WeightPack
      } else if (product.productType === "WeightPack") {
        const flatVariant = product.flatVariants.id(variantId);
        if (!flatVariant)
          return res
            .status(404)
            .json({ success: false, error: "Variant not found" });

        const previousVariantStock = flatVariant.countInStock;
        flatVariant.countInStock = Number(countInStock);
        if (location) flatVariant.location = location;

        if (previousVariantStock <= 0 && Number(countInStock) > 0) {
          await notifyBackInStockUsers({
            product,
            variantId,
            triggeredBy: req.user?._id,
          });
        }
      } else {
        return res
          .status(400)
          .json({ success: false, error: "This product has no variants" });
      }
    } else {
      product.countInStock = Number(countInStock);
      if (previousStock <= 0 && Number(countInStock) > 0) {
        await notifyBackInStockUsers({ product, triggeredBy: req.user?._id });
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: variantId
        ? "Variant stock updated successfully"
        : "Product stock updated successfully",
      product,
    });
  } catch (error) {
    console.error("Stock update error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// version - 1.1
// const getLowStockProducts = asyncHandler(async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const search = req.query.search || "";
//     let sortField = req.query.sortBy || "createdAt";
//     const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

//     if (sortField === "date") sortField = "createdAt";

//     const searchQuery = search ? { name: { $regex: search, $options: "i" } } : {};

//     const allProducts = await Product.find(
//       searchQuery,
//       "name countInStock lowStockThreshold colorVariants flatVariants images createdAt productType"
//     );

//     const finalProducts = [];

//     for (const product of allProducts) {
//       // ColorSize products
//       if (product.productType === "ColorSize" && Array.isArray(product.colorVariants)) {
//         const lowStockVariants = [];

//         product.colorVariants.forEach((color) => {
//           if (Array.isArray(color.sizes)) {
//             const lowStockSizes = color.sizes.filter(
//               (size) =>
//                 typeof size.countInStock === "number" &&
//                 typeof size.variantStockThreshold === "number" &&
//                 size.countInStock <= size.variantStockThreshold
//             );

//             if (lowStockSizes.length > 0) {
//               lowStockVariants.push({
//                 colorName: color.name,
//                 colorCode: color.code,
//                 sizes: lowStockSizes,
//                 images: color.images,
//               });
//             }
//           }
//         });

//         if (lowStockVariants.length > 0) {
//           finalProducts.push({
//             _id: product._id,
//             name: product.name,
//             productType: "ColorSize",
//             variants: lowStockVariants,
//             images: product.images,
//             createdAt: product.createdAt,
//           });
//         }

//       //  WeightPack products
//       } else if (product.productType === "WeightPack" && Array.isArray(product.flatVariants)) {
//         const lowStockVariants = product.flatVariants.filter(
//           (v) =>
//             typeof v.countInStock === "number" &&
//             typeof v.variantStockThreshold === "number" &&
//             v.countInStock <= v.variantStockThreshold
//         );

//         if (lowStockVariants.length > 0) {
//           finalProducts.push({
//             _id: product._id,
//             name: product.name,
//             productType: "WeightPack",
//             variants: lowStockVariants,
//             images: product.images,
//             createdAt: product.createdAt,
//           });
//         }

//       //  Single products
//       } else {
//         if (
//           typeof product.countInStock === "number" &&
//           typeof product.lowStockThreshold === "number" &&
//           product.countInStock <= product.lowStockThreshold
//         ) {
//           finalProducts.push({
//             _id: product._id,
//             name: product.name,
//             productType: "Single",
//             countInStock: product.countInStock,
//             lowStockThreshold: product.lowStockThreshold,
//             images: product.images,
//             variants: [],
//             createdAt: product.createdAt,
//           });
//         }
//       }
//     }

//     // In-memory sort
//     finalProducts.sort((a, b) => {
//       const aVal = a[sortField];
//       const bVal = b[sortField];
//       if (aVal < bVal) return -1 * sortOrder;
//       if (aVal > bVal) return 1 * sortOrder;
//       return 0;
//     });

//     // Pagination
//     const totalItems = finalProducts.length;
//     const totalPages = Math.ceil(totalItems / limit);
//     const paginatedProducts = finalProducts.slice(skip, skip + limit);

//     res.status(200).json({
//       success: true,
//       message: "Filtered low stock products and variants fetched successfully",
//       count: totalItems,
//       products: paginatedProducts,
//       pagination: {
//         totalItems,
//         totalPages,
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Failed to fetch low stock products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch low stock products",
//       error: error.message,
//     });
//   }
// });

const getLowStockProducts = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    let sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    if (sortField === "date") sortField = "createdAt";
    if (sortField === "subscribers") sortField = "totalSubscribers";

    const role = req.user?.role;
    const queryFranchiseId = req.query.franchiseId || null;

    if (
      queryFranchiseId &&
      !mongoose.Types.ObjectId.isValid(queryFranchiseId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid franchise ID" });
    }

    const effectiveFranchiseId =
      role === "Admin"
        ? queryFranchiseId || null
        : req.user?.franchiseId?.toString() || null;

    // ── Shared: build subscriber map ──────────────────────────────────────────
    const buildSubscriberMap = async (productIds) => {
      const subscriptionCounts = await stockNotificationSchema.aggregate([
        { $match: { productId: { $in: productIds } } },
        {
          $group: {
            _id: { productId: "$productId", variantId: "$variantId" },
            subscriberCount: { $sum: 1 },
          },
        },
      ]);

      const map = new Map();
      for (const item of subscriptionCounts) {
        const productId = item._id.productId?.toString();
        const variantId = item._id.variantId
          ? item._id.variantId.toString()
          : "null";
        map.set(`${productId}_${variantId}`, item.subscriberCount || 0);
      }
      return map;
    };

    const getSubscriberCount = (map, productId, variantId = null) => {
      return (
        map.get(
          `${productId.toString()}_${variantId ? variantId.toString() : "null"}`,
        ) || 0
      );
    };

    // ── FRANCHISE SCOPED — StoreManager / InventoryStaff / Admin with franchiseId ──
    if (effectiveFranchiseId) {
      const matchQuery = {
        ...(search && { name: { $regex: search, $options: "i" } }),
        franchiseInventories: {
          $elemMatch: {
            franchiseId: new mongoose.Types.ObjectId(effectiveFranchiseId),
            isEnable: true,
          },
        },
      };

      const allProducts = await Product.find(
        matchQuery,
        "name images productType franchiseInventories createdAt",
      ).lean();

      // ✅ Build subscriber map for these products
      const productIds = allProducts.map((p) => p._id);
      const subscriberMap = await buildSubscriberMap(productIds);

      const finalProducts = [];

      for (const product of allProducts) {
        const inv = product.franchiseInventories?.find(
          (fi) => fi.franchiseId.toString() === effectiveFranchiseId,
        );
        if (!inv) continue;

        // ── Single ────────────────────────────────────────────────────────────
        if (product.productType === "Single") {
          if (
            typeof inv.countInStock === "number" &&
            typeof inv.lowStockThreshold === "number" &&
            inv.countInStock <= inv.lowStockThreshold
          ) {
            const subscriberCount = getSubscriberCount(
              subscriberMap,
              product._id,
            );
            finalProducts.push({
              _id: product._id,
              name: product.name,
              productType: "Single",
              images: product.images,
              createdAt: product.createdAt,
              countInStock: inv.countInStock,
              lowStockThreshold: inv.lowStockThreshold,
              offerPrice: inv.offerPrice,
              variants: [],
              subscriberCount,
              totalSubscribers: subscriberCount, // ✅
            });
          }

          // ── WeightPack ────────────────────────────────────────────────────────
        } else if (product.productType === "WeightPack") {
          const lowStockVariants = (inv.flatVariants || [])
            .filter(
              (v) =>
                typeof v.countInStock === "number" &&
                typeof v.variantStockThreshold === "number" &&
                v.countInStock <= v.variantStockThreshold,
            )
            .map((v) => ({
              ...v,
              subscriberCount: getSubscriberCount(
                subscriberMap,
                product._id,
                v._id,
              ), // ✅
            }));

          if (lowStockVariants.length > 0) {
            finalProducts.push({
              _id: product._id,
              name: product.name,
              productType: "WeightPack",
              images: product.images,
              createdAt: product.createdAt,
              variants: lowStockVariants,
              totalSubscribers: lowStockVariants.reduce(
                // ✅
                (sum, v) => sum + (v.subscriberCount || 0),
                0,
              ),
            });
          }

          // ── ColorSize ─────────────────────────────────────────────────────────
        } else if (product.productType === "ColorSize") {
          const lowStockVariants = [];

          (inv.colorVariants || []).forEach((color) => {
            const lowStockSizes = (color.sizes || [])
              .filter(
                (s) =>
                  typeof s.countInStock === "number" &&
                  typeof s.variantStockThreshold === "number" &&
                  s.countInStock <= s.variantStockThreshold,
              )
              .map((s) => ({
                ...s,
                subscriberCount: getSubscriberCount(
                  subscriberMap,
                  product._id,
                  s._id,
                ), // ✅
              }));

            if (lowStockSizes.length > 0) {
              lowStockVariants.push({
                colorName: color.name,
                colorCode: color.code,
                images: color.images,
                sizes: lowStockSizes,
                totalVariantSubscribers: lowStockSizes.reduce(
                  // ✅
                  (sum, s) => sum + (s.subscriberCount || 0),
                  0,
                ),
              });
            }
          });

          if (lowStockVariants.length > 0) {
            finalProducts.push({
              _id: product._id,
              name: product.name,
              productType: "ColorSize",
              images: product.images,
              createdAt: product.createdAt,
              variants: lowStockVariants,
              totalSubscribers: lowStockVariants.reduce(
                // ✅
                (sum, v) => sum + (v.totalVariantSubscribers || 0),
                0,
              ),
            });
          }
        }
      }

      // sort + paginate
      finalProducts.sort((a, b) => {
        const aVal = a[sortField] ?? 0;
        const bVal = b[sortField] ?? 0;
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });

      const totalItems = finalProducts.length;
      const paginatedProducts = finalProducts.slice(skip, skip + limit);

      return res.status(200).json({
        success: true,
        message: "Low stock products for your store",
        count: totalItems,
        products: paginatedProducts,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit,
        },
      });
    }

    // ── ADMIN — master/warehouse stock ────────────────────────────────────────
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const allProducts = await Product.find(
      searchQuery,
      "name countInStock lowStockThreshold colorVariants flatVariants images createdAt productType",
    ).lean();

    // ✅ Build subscriber map
    const productIds = allProducts.map((p) => p._id);
    const subscriberMap = await buildSubscriberMap(productIds);

    const finalProducts = [];

    for (const product of allProducts) {
      // ── ColorSize ───────────────────────────────────────────────────────────
      if (
        product.productType === "ColorSize" &&
        Array.isArray(product.colorVariants)
      ) {
        const lowStockVariants = [];

        product.colorVariants.forEach((color) => {
          if (Array.isArray(color.sizes)) {
            const lowStockSizes = color.sizes
              .filter(
                (size) =>
                  typeof size.countInStock === "number" &&
                  typeof size.variantStockThreshold === "number" &&
                  size.countInStock <= size.variantStockThreshold,
              )
              .map((size) => ({
                ...size,
                subscriberCount: getSubscriberCount(
                  subscriberMap,
                  product._id,
                  size._id,
                ), // ✅
              }));

            if (lowStockSizes.length > 0) {
              lowStockVariants.push({
                colorName: color.name,
                colorCode: color.code,
                sizes: lowStockSizes,
                images: color.images,
                totalVariantSubscribers: lowStockSizes.reduce(
                  // ✅
                  (sum, s) => sum + (s.subscriberCount || 0),
                  0,
                ),
              });
            }
          }
        });

        if (lowStockVariants.length > 0) {
          finalProducts.push({
            _id: product._id,
            name: product.name,
            productType: "ColorSize",
            variants: lowStockVariants,
            images: product.images,
            createdAt: product.createdAt,
            totalSubscribers: lowStockVariants.reduce(
              // ✅
              (sum, v) => sum + (v.totalVariantSubscribers || 0),
              0,
            ),
          });
        }

        // ── WeightPack ──────────────────────────────────────────────────────────
      } else if (
        product.productType === "WeightPack" &&
        Array.isArray(product.flatVariants)
      ) {
        const lowStockVariants = product.flatVariants
          .filter(
            (v) =>
              typeof v.countInStock === "number" &&
              typeof v.variantStockThreshold === "number" &&
              v.countInStock <= v.variantStockThreshold,
          )
          .map((v) => ({
            ...v,
            subscriberCount: getSubscriberCount(
              subscriberMap,
              product._id,
              v._id,
            ), // ✅
          }));

        if (lowStockVariants.length > 0) {
          finalProducts.push({
            _id: product._id,
            name: product.name,
            productType: "WeightPack",
            variants: lowStockVariants,
            images: product.images,
            createdAt: product.createdAt,
            totalSubscribers: lowStockVariants.reduce(
              // ✅
              (sum, v) => sum + (v.subscriberCount || 0),
              0,
            ),
          });
        }

        // ── Single ──────────────────────────────────────────────────────────────
      } else {
        if (
          typeof product.countInStock === "number" &&
          typeof product.lowStockThreshold === "number" &&
          product.countInStock <= product.lowStockThreshold
        ) {
          const subscriberCount = getSubscriberCount(
            subscriberMap,
            product._id,
          ); // ✅
          finalProducts.push({
            _id: product._id,
            name: product.name,
            productType: "Single",
            countInStock: product.countInStock,
            lowStockThreshold: product.lowStockThreshold,
            images: product.images,
            variants: [],
            createdAt: product.createdAt,
            subscriberCount,
            totalSubscribers: subscriberCount, // ✅
          });
        }
      }
    }

    finalProducts.sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    const totalItems = finalProducts.length;
    const paginatedProducts = finalProducts.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      message: "Filtered low stock products fetched successfully",
      count: totalItems,
      products: paginatedProducts,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Failed to fetch low stock products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock products",
      error: error.message,
    });
  }
});

//gk:1.1
const importProducts = async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(200).json({
      status: false,
      message: "Products array is required and cannot be empty.",
      data: [],
      errors: [],
    });
  }

  const errors = [];
  const importedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const productData = products[i];

    try {
      //  Validate required fields
      if (!productData.name) {
        errors.push({
          index: i,
          product: productData.name || `Index ${i}`,
          message: "Product name is required.",
        });
        continue;
      }

      // CATEGORY: Required
      let categoryName = "";
      if (typeof productData.category === "string")
        categoryName = productData.category.trim();
      else if (
        typeof productData.category === "object" &&
        productData.category?.name
      )
        categoryName = productData.category.name.trim();

      if (!categoryName) {
        errors.push({
          index: i,
          product: productData.name,
          message: "Category is required.",
        });
        continue;
      }

      const categoryDoc = await categoryModel.findOne({ name: categoryName });
      if (!categoryDoc) {
        errors.push({
          index: i,
          product: productData.name,
          message: `Category '${categoryName}' is invalid.`,
        });
        continue;
      }

      // BRAND: Optional, validate if passed
      let brandDoc = null;
      if (productData.brand) {
        let brandName =
          typeof productData.brand === "string"
            ? productData.brand.trim()
            : productData.brand.name?.trim();
        if (brandName) brandDoc = await brand.findOne({ name: brandName });
        if (brandName && !brandDoc) {
          errors.push({
            index: i,
            product: productData.name,
            message: `Brand '${brandName}' is invalid.`,
          });
          continue;
        }
      }

      // SUBCATEGORY: Optional, validate if passed
      let subCategoryDoc = null;
      if (productData.subCategory) {
        let subCategoryName =
          typeof productData.subCategory === "string"
            ? productData.subCategory.trim()
            : productData.subCategory.name?.trim();
        if (subCategoryName)
          subCategoryDoc = await subCategorySchema.findOne({
            name: subCategoryName,
          });
        if (subCategoryName && !subCategoryDoc) {
          errors.push({
            index: i,
            product: productData.name,
            message: `SubCategory '${subCategoryName}' is invalid.`,
          });
          continue;
        }
      }

      // SEGMENT: Optional, validate if passed
      let segmentDoc = null;
      if (productData.segment) {
        let segmentName = productData.segment.trim();
        if (segmentName)
          segmentDoc = await segmentSchema.findOne({ name: segmentName });
        if (segmentName && !segmentDoc) {
          errors.push({
            index: i,
            product: productData.name,
            message: `Segment '${segmentName}' is invalid.`,
          });
          continue;
        }
      }

      // Count validations
      if (productData.countInStock < 0) {
        errors.push({
          index: i,
          product: productData.name,
          message: `CountInStock (${productData.countInStock}) cannot be negative.`,
        });
        continue;
      }

      if (
        productData.lowStockThreshold != null &&
        productData.countInStock < productData.lowStockThreshold
      ) {
        errors.push({
          index: i,
          product: productData.name,
          message: `CountInStock (${productData.countInStock}) is less than LowStockThreshold (${productData.lowStockThreshold}).`,
        });
        continue;
      }

      // Only single product type allowed
      if (productData.productType && productData.productType !== "Single") {
        errors.push({
          index: i,
          product: productData.name,
          message: `Only 'Single' productType is allowed.`,
        });
        continue;
      }

      // Duplicate check (skip if all key fields match)
      const existingProduct = await Product.findOne({
        name: productData.name,
        mrp: productData.mrp || 0,
        offerPrice: productData.offerPrice || 0,
        minOrderQuantity: productData.minOrderQuantity || 1,
        maxOrderQuantity: productData.maxOrderQuantity || null,
        countInStock: productData.countInStock || 0,
        lowStockThreshold: productData.lowStockThreshold || 0,
        color: {
          name: productData.colorName || "",
          code: productData.colorCode || "",
        },
        size: productData.size || "",
        brand: brandDoc
          ? { _id: brandDoc._id, name: brandDoc.name }
          : productData.brand || null,
        category: { _id: categoryDoc._id, name: categoryDoc.name },
        subCategory: subCategoryDoc
          ? { _id: subCategoryDoc._id, name: subCategoryDoc.name }
          : productData.subCategory || null,
        segment: segmentDoc ? segmentDoc.name : productData.segment || null,
      });

      if (existingProduct) {
        // Skip creating duplicate product
        continue;
      }

      // Prepare and save product
      const newProduct = new Product({
        name: productData.name,
        productType: "Single",
        hasVariants: false,
        color: {
          name: productData.colorName || "",
          code: productData.colorCode || "",
        },
        size: productData.size || "",
        images: productData.images || [],
        brand: brandDoc
          ? { _id: brandDoc._id, name: brandDoc.name }
          : productData.brand || null,
        category: { _id: categoryDoc._id, name: categoryDoc.name },
        subCategory: subCategoryDoc
          ? { _id: subCategoryDoc._id, name: subCategoryDoc.name }
          : productData.subCategory || null,
        segment: segmentDoc ? segmentDoc.name : productData.segment || null,
        description: productData.description || "",
        aboutTheBrand: productData.aboutTheBrand || "",
        specification: productData.specification || "",
        tags: productData.tags || [],
        keywords: productData.keywords || [],
        mrp: productData.mrp || 0,
        offerPrice: productData.offerPrice || 0,
        minOrderQuantity: productData.minOrderQuantity || 1,
        maxOrderQuantity: productData.maxOrderQuantity || null,
        countInStock: productData.countInStock || 0,
        lowStockThreshold: productData.lowStockThreshold || 0,
        tax: productData.tax || 0,
        // deliveryTime: { value: productData.deliveryDays || 3, unit: "days" },
        returnable: productData.returnable !== false,
        returnWindow: productData.returnWindow || 7,
        warrantyPeriod: productData.warrantyPeriod || "",
        visibility: productData.visibility || "Public",
        isEnable: true,
        isAvailable: true,
        isFeatured: productData.isFeatured || false,
        isBestSeller: productData.isBestSeller || false,
        attributes: productData.attributes || [],
        createdBy: productData.createdBy,
      });

      const savedProduct = await newProduct.save();
      importedProducts.push(savedProduct);
    } catch (error) {
      errors.push({
        index: i,
        product: productData?.name || `Index ${i}`,
        message: error.message,
      });
    }
  }

  return res.status(200).json({
    status: errors.length === 0,
    message:
      errors.length === 0
        ? "All products imported successfully."
        : "Some products failed to import.",
    data: importedProducts,
    errors,
  });
};

const getProductStockDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch product details
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Calculate allocated stock
    const allocatedData = await User.aggregate([
      { $unwind: "$cart" },
      { $match: { "cart.productId": new mongoose.Types.ObjectId(productId) } }, // Match specific product
      { $group: { _id: null, totalAllocated: { $sum: "$cart.qty" } } },
    ]);

    const allocated =
      allocatedData.length > 0 ? allocatedData[0].totalAllocated : 0;

    // Calculate free stock
    const freeStock = Math.max(0, product.countInStock - allocated);

    return res.status(200).json({
      success: true,
      data: {
        totalStock: product.countInStock,
        allocated,
        freeStock,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
//getProductByCategory
const getProductByCategory = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id, "id");

    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;
    const franchiseFilter = franchiseId
      ? {
          franchiseInventories: {
            $elemMatch: {
              franchiseId: new mongoose.Types.ObjectId(franchiseId),
              isEnable: true,
              outOfStock: false,
            },
          },
        }
      : {};

    const rawProducts = await Product.find({ category: id, ...franchiseFilter })
      .populate("brand", "name")
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean(); // ✅ lean() needed for overlayInventory to work on plain objects

    if (!rawProducts || rawProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }

    // ✅ overlay store inventory
    const products = overlayInventory(rawProducts, franchiseId);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//getProductBySubCategoryId
const getProductBySubCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;

    const franchiseFilter = franchiseId
      ? {
          franchiseInventories: {
            $elemMatch: {
              franchiseId: new mongoose.Types.ObjectId(franchiseId),
              isEnable: true,
              outOfStock: false,
            },
          },
        }
      : {};

    const rawProducts = await Product.find({
      subCategory: id,
      ...franchiseFilter,
    })
      .populate("brand", "name")
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean(); // ✅ lean() needed for overlayInventory to work on plain objects

    if (!rawProducts || rawProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this SubCategory" });
    }

    // ✅ overlay store inventory
    const products = overlayInventory(rawProducts, franchiseId);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by SubCategory:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get Products by Segment ID
const getProductBySegment = async (req, res) => {
  try {
    const id = req.params.id;

    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;
    const franchiseFilter = franchiseId
      ? {
          franchiseInventories: {
            $elemMatch: {
              franchiseId: new mongoose.Types.ObjectId(franchiseId),
              isEnable: true,
              outOfStock: false,
            },
          },
        }
      : {};

    const rawProducts = await Product.find({ segment: id, ...franchiseFilter })
      .populate("brand", "name")
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean(); // ✅ lean() needed for overlayInventory to work on plain objects

    if (!rawProducts || rawProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this segment" });
    }

    // ✅ overlay store inventory
    const products = overlayInventory(rawProducts, franchiseId);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by Segment:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const deleteProductsByTime = async (req, res) => {
  try {
    // Create a Date object for 2025-02-13 13:49:00 (1:49 PM)
    const targetDate = new Date("2025-02-13T13:49:00.000Z");

    // Find and delete all products created before the target date
    const result = await Product.deleteMany({
      createdAt: { $lt: targetDate },
    });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        success: true,
        message: `Successfully deleted ${
          result.deletedCount
        } products created before ${targetDate.toISOString()}`,
        deletedCount: result.deletedCount,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No products found before the specified date",
      });
    }
  } catch (error) {
    console.error("Error deleting products:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting products",
      error: error.message,
    });
  }
};

const getProductsByBrandId = async (req, res) => {
  try {
    const { brandId } = req.params;
    if (!brandId) {
      return res.status(400).json({ message: "Brand ID is required" });
    }

    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;
    const franchiseFilter = franchiseId
      ? {
          franchiseInventories: {
            $elemMatch: {
              franchiseId: new mongoose.Types.ObjectId(franchiseId),
              isEnable: true,
              outOfStock: false,
            },
          },
        }
      : {};

    // Find products that match the brand ID
    const products = await Product.find({ brand: brandId, ...franchiseFilter })
      .populate("brand", "name")
      .populate("category", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockNotificationSubscribers = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId, page = 1, limit = 10, search = "" } = req.query;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);

  const product = await Product.findById(productId).lean();

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  let variantDetails = null;

  if (variantId) {
    if (
      product.productType === "WeightPack" &&
      Array.isArray(product.flatVariants)
    ) {
      variantDetails =
        product.flatVariants.find((v) => v._id.toString() === variantId) ||
        null;
    }

    if (
      product.productType === "ColorSize" &&
      Array.isArray(product.colorVariants)
    ) {
      for (const color of product.colorVariants) {
        const matchedSize = (color.sizes || []).find(
          (size) => size._id.toString() === variantId,
        );

        if (matchedSize) {
          variantDetails = {
            ...matchedSize,
            colorName: color.name,
            colorCode: color.code,
            colorImages: color.images || [],
          };
          break;
        }
      }
    }

    if (!variantDetails) {
      return res.status(404).json({
        success: false,
        message: "Variant not found for this product",
      });
    }
  }

  const filter = {
    productId,
    variantId: variantId || null,
  };

  const subscriptions = await stockNotificationSchema
    .find(filter)
    .populate("userId", "username email contactNo")
    .sort({ createdAt: -1 })
    .lean();

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSubscriptions = normalizedSearch
    ? subscriptions.filter((sub) => {
        const user = sub.userId || {};
        const username = user.username?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const contactNo = user.contactNo?.toLowerCase() || "";

        return (
          username.includes(normalizedSearch) ||
          email.includes(normalizedSearch) ||
          contactNo.includes(normalizedSearch)
        );
      })
    : subscriptions;

  const totalItems = filteredSubscriptions.length;
  const totalPages = Math.ceil(totalItems / limitNumber) || 1;
  const skip = (pageNumber - 1) * limitNumber;

  const paginatedSubscriptions = filteredSubscriptions.slice(
    skip,
    skip + limitNumber,
  );

  const formattedSubscribers = paginatedSubscriptions.map((sub) => ({
    subscriptionId: sub._id,
    subscribedAt: sub.createdAt,
    notified: sub.notified,
    user: sub.userId,
  }));

  return res.status(200).json({
    success: true,
    message: "Subscribers fetched successfully",
    product: {
      _id: product._id,
      name: product.name,
      productType: product.productType,
      images: product.images || [],
    },
    variant: variantDetails,
    subscriberCount: totalItems,
    subscribers: formattedSubscribers,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  });
});

const subscribeStockNotification = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  // ── Validate product exists ───────────────────────────────────────────────
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // ── Validate variantId belongs to this product ────────────────────────────
  if (variantId) {
    let variantExists = false;

    if (product.productType === "WeightPack") {
      variantExists = product.flatVariants.some(
        (v) => v._id.toString() === variantId.toString(),
      );
    } else if (product.productType === "ColorSize") {
      variantExists = product.colorVariants.some((cv) =>
        cv.sizes.some((s) => s._id.toString() === variantId.toString()),
      );
    }

    if (!variantExists) {
      return res.status(400).json({
        success: false,
        message: "Variant not found in this product",
      });
    }
  }

  // ── Check if product/variant is actually out of stock ─────────────────────
  // No point subscribing if it's already in stock
  const franchiseId =
    req.user?.franchiseId?.toString() ||
    req.query.franchiseId ||
    req.body.franchiseId ||
    null;

  if (franchiseId) {
    // ✅ Check franchise inventory stock
    const inv = product.franchiseInventories?.find(
      (fi) => fi.franchiseId.toString() === franchiseId,
    );

    if (inv && !inv.outOfStock) {
      // Check variant level if variantId provided
      if (variantId) {
        let variantInStock = false;
        if (product.productType === "WeightPack") {
          const v = inv.flatVariants?.find(
            (fv) => fv._id.toString() === variantId.toString(),
          );
          variantInStock = v ? (v.countInStock || 0) > 0 : false;
        } else if (product.productType === "ColorSize") {
          for (const cv of inv.colorVariants || []) {
            const s = cv.sizes?.find(
              (sz) => sz._id.toString() === variantId.toString(),
            );
            if (s) {
              variantInStock = (s.countInStock || 0) > 0;
              break;
            }
          }
        }
        if (variantInStock) {
          return res.status(400).json({
            success: false,
            message: "This variant is already in stock",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "This product is already in stock in your store",
        });
      }
    }
  } else {
    // ✅ Check master stock
    if (!product.outOfStock) {
      if (!variantId) {
        return res.status(400).json({
          success: false,
          message: "This product is already in stock",
        });
      }
    }
  }

  // ── Upsert subscription ───────────────────────────────────────────────────
  const existingSubscription = await stockNotificationSchema.findOne({
    userId: req.user._id,
    productId,
    variantId: variantId || null,
  });

  const subscription = await stockNotificationSchema.findOneAndUpdate(
    {
      userId: req.user._id,
      productId,
      variantId: variantId || null,
    },
    {
      $set: {
        notified: false,
        franchiseId: franchiseId || null, // ✅ track which store this is for
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return res.status(200).json({
    success: true,
    subscribed: true,
    alreadySubscribed: !!existingSubscription,
    message: existingSubscription
      ? "Already subscribed for stock notifications"
      : "Subscribed! We'll notify you when this is back in stock.",
    subscription,
  });
});

// POST /products/bulk-sync-to-store
// body: { franchiseId } — sync ALL products to one store
// Admin only

const bulkSyncAllProductsToStore = asyncHandler(async (req, res) => {
  const { franchiseId } = req.body;
  if (!franchiseId)
    return res.status(400).json({ error: "franchiseId is required" });

  const products = await Product.find({ isAvailable: true }).lean();

  if (!products.length)
    return res.json({ success: true, message: "No products found", synced: 0 });

  const bulkOps = [];
  let newlyLinked = 0;
  let updated = 0;

  for (const product of products) {
    const inv = product.franchiseInventories?.find(
      (fi) => fi.franchiseId.toString() === franchiseId.toString(),
    );

    if (!inv) {
      // ── Not linked yet → push new entry ────────────────────────────────
      newlyLinked++;
      bulkOps.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $push: {
              franchiseInventories: {
                franchiseId,
                mrp: product.mrp,
                offerPrice: product.offerPrice,
                countInStock: product.countInStock,
                minOrderQuantity: product.minOrderQuantity,
                maxOrderQuantity: product.maxOrderQuantity,
                lowStockThreshold: product.lowStockThreshold || 10,
                outOfStock: (product.countInStock || 0) === 0,
                isEnable: false,
                // ✅ deep clone — no shared references
                flatVariants:
                  product.productType === "WeightPack"
                    ? JSON.parse(JSON.stringify(product.flatVariants || []))
                    : [],
                colorVariants:
                  product.productType === "ColorSize"
                    ? JSON.parse(JSON.stringify(product.colorVariants || []))
                    : [],
              },
            },
          },
        },
      });
    } else {
      // ── Already linked → update values from master ──────────────────────
      updated++;

      const updateFields = {
        "franchiseInventories.$.mrp": product.mrp,
        "franchiseInventories.$.offerPrice": product.offerPrice,
        "franchiseInventories.$.countInStock": product.countInStock,
        "franchiseInventories.$.lowStockThreshold":
          product.lowStockThreshold || 10,
        "franchiseInventories.$.outOfStock": (product.countInStock || 0) === 0,
        "franchiseInventories.$.minOrderQuantity": product.minOrderQuantity,
        "franchiseInventories.$.maxOrderQuantity": product.maxOrderQuantity,
      };

      // ✅ deep clone variants
      if (product.productType === "WeightPack") {
        updateFields["franchiseInventories.$.flatVariants"] = JSON.parse(
          JSON.stringify(product.flatVariants || []),
        );
      }
      if (product.productType === "ColorSize") {
        updateFields["franchiseInventories.$.colorVariants"] = JSON.parse(
          JSON.stringify(product.colorVariants || []),
        );
      }

      bulkOps.push({
        updateOne: {
          filter: {
            _id: product._id,
            "franchiseInventories.franchiseId": new mongoose.Types.ObjectId(
              franchiseId,
            ),
          },
          update: { $set: updateFields },
        },
      });
    }
  }

  // ✅ Single DB operation instead of N saves in a loop
  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps, { ordered: false });
  }

  res.json({
    success: true,
    message: `Bulk sync complete. ${newlyLinked} newly linked, ${updated} updated.`,
    newlyLinked,
    updated,
    total: products.length,
  });
});

// POST /products/bulk-sync
// body: { productIds: [], franchiseIds: [] }
// Admin only

const bulkSyncSelectedProducts = asyncHandler(async (req, res) => {
  const { productIds, franchiseIds } = req.body;

  if (!Array.isArray(productIds) || !productIds.length)
    return res.status(400).json({ error: "productIds[] is required" });
  if (!Array.isArray(franchiseIds) || !franchiseIds.length)
    return res.status(400).json({ error: "franchiseIds[] is required" });

  const products = await Product.find({
    _id: { $in: productIds },
  }).lean();

  const bulkOps = [];
  let newlyLinked = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    for (const fId of franchiseIds) {
      const inv = product.franchiseInventories?.find(
        (fi) => fi.franchiseId.toString() === fId.toString(),
      );

      if (!inv) {
        newlyLinked++;
        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $push: {
                franchiseInventories: {
                  franchiseId: fId,
                  mrp: product.mrp,
                  offerPrice: product.offerPrice,
                  countInStock: product.countInStock,
                  minOrderQuantity: product.minOrderQuantity,
                  maxOrderQuantity: product.maxOrderQuantity,
                  lowStockThreshold: product.lowStockThreshold || 10,
                  outOfStock: (product.countInStock || 0) === 0,
                  isEnable: false,
                  flatVariants:
                    product.productType === "WeightPack"
                      ? JSON.parse(JSON.stringify(product.flatVariants || []))
                      : [],
                  colorVariants:
                    product.productType === "ColorSize"
                      ? JSON.parse(JSON.stringify(product.colorVariants || []))
                      : [],
                },
              },
            },
          },
        });
      } else {
        updated++;
        const updateFields = {
          "franchiseInventories.$.mrp": product.mrp,
          "franchiseInventories.$.offerPrice": product.offerPrice,
          "franchiseInventories.$.countInStock": product.countInStock,
          "franchiseInventories.$.lowStockThreshold":
            product.lowStockThreshold || 10,
          "franchiseInventories.$.outOfStock":
            (product.countInStock || 0) === 0,
          "franchiseInventories.$.minOrderQuantity": product.minOrderQuantity,
          "franchiseInventories.$.maxOrderQuantity": product.maxOrderQuantity,
        };

        if (product.productType === "WeightPack") {
          updateFields["franchiseInventories.$.flatVariants"] = JSON.parse(
            JSON.stringify(product.flatVariants || []),
          );
        }
        if (product.productType === "ColorSize") {
          updateFields["franchiseInventories.$.colorVariants"] = JSON.parse(
            JSON.stringify(product.colorVariants || []),
          );
        }

        bulkOps.push({
          updateOne: {
            filter: {
              _id: product._id,
              "franchiseInventories.franchiseId": new mongoose.Types.ObjectId(
                fId,
              ),
            },
            update: { $set: updateFields },
          },
        });
      }
    }
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps, { ordered: false });
  }

  res.json({
    success: true,
    message: `Done. ${newlyLinked} newly linked, ${updated} updated, ${skipped} skipped.`,
    summary: { newlyLinked, updated, skipped, total: bulkOps.length },
  });
});

// Scan product by barcode

const scanProductByBarcode = asyncHandler(async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: "Barcode is required",
      });
    }

    const franchiseId =
      req.user?.franchiseId?.toString() || req.query.franchiseId || null;

    // A store can override a variant barcode, so look in its own inventory
    // first. Fall back to the master barcode for single products.
    const inventoryMatch = franchiseId
      ? await FranchiseInventory.findOne({ franchiseId, barcode, quantity: { $gt: 0 }, isActive: true }).lean()
      : null;
    const product = await Product.findOne(inventoryMatch ? { _id: inventoryMatch.productId } : {
      $or: [
        { barcode },
        { "flatVariants.barcode": barcode },
        { "colorVariants.sizes.barcode": barcode },
      ],
    })
      .populate("brand", "name")
      .populate("category")
      .populate("subCategory")
      .populate("segment")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found.",
      });
    }

    // Separate franchise inventory is the only inventory used by POS scans.
    if (franchiseId) {
      const batches = await FranchiseInventory.find(inventoryMatch ? { franchiseId, productId: product._id, barcode, quantity: { $gt: 0 }, isActive: true } : { franchiseId, productId: product._id, quantity: { $gt: 0 }, isActive: true }).sort({ expiryDate: 1, createdAt: 1 }).lean();
      const inventory = batches[0];
      if (!inventory) {
        return res.status(404).json({ success: false, message: "This product is not in your franchise inventory." });
      }
      const totalStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);
      return res.json({
        success: true,
        message: "Barcode scanned successfully.",
        scannedVariant: {
          productId: product._id, masterVariantId: inventory.masterVariantId,
          productType: inventory.masterVariantId ? "Variant" : "Single", name: product.name,
          image: product.images?.[0] || "", barcode: barcode, sku: product.sku,
          color: inventory.color, size: inventory.size,
          mrp: product.mrp, offerPrice: inventory.sellingPrice, countInStock: totalStock,
          location: inventory.location, tax: product.tax || 0,
        },
      });
    }

    let response = {
      ...product,
      franchiseInventories: undefined,
    };

    // Overlay franchise inventory
    if (franchiseId && product.franchiseInventories?.length) {
      const inventory = product.franchiseInventories.find(
        (f) => f.franchiseId.toString() === franchiseId,
      );

      if (inventory) {
        response = {
          ...response,
          mrp: inventory.mrp,
          offerPrice: inventory.offerPrice,
          countInStock: inventory.countInStock,
          outOfStock: inventory.outOfStock,
          isEnable: inventory.isEnable,
          minOrderQuantity: inventory.minOrderQuantity,
          maxOrderQuantity: inventory.maxOrderQuantity,
          lowStockThreshold: inventory.lowStockThreshold,
          flatVariants: inventory.flatVariants,
          colorVariants: inventory.colorVariants,
          location: inventory.location,
        };
      }
    }

    // Detect scanned variant
    let scannedVariant = null;

    // Product barcode
    if (product.barcode === barcode) {
      scannedVariant = {
        productId: product._id,
        productType: "Single",

        name: product.name,
        image: product.images?.[0] || "",

        barcode: product.barcode,
        sku: product.sku,

        mrp: response.mrp,
        offerPrice: response.offerPrice,

        countInStock: response.countInStock,

        minOrderQuantity: response.minOrderQuantity,
        maxOrderQuantity: response.maxOrderQuantity,

        location: response.location,

        tax: product.tax || 0,
      };
    }

    // WeightPack barcode
    if (!scannedVariant) {
  const variant = response.flatVariants?.find(
    (v) => v.barcode === barcode
  );

  if (variant) {
    scannedVariant = {
      productId: product._id,
      productType: "WeightPack",

      name: product.name,
      image: product.images?.[0] || "",

      size: variant.size,

      barcode: variant.barcode,
      sku: variant.sku,

      mrp: variant.mrp,
      offerPrice: variant.offerPrice,

      countInStock: variant.countInStock,

      minOrderQuantity: variant.minOrderQuantity,
      maxOrderQuantity: variant.maxOrderQuantity,

      location: variant.location,

      tax: product.tax || 0,
    };
  }
}

    // ColorSize barcode
    if (!scannedVariant) {
  for (const color of response.colorVariants || []) {
    const size = color.sizes.find(
      (s) => s.barcode === barcode
    );

    if (size) {
      scannedVariant = {
        productId: product._id,
        productType: "ColorSize",

        name: product.name,
        image: product.images?.[0] || "",

        color: color.name,
        colorCode: color.code,

        size: size.size,

        barcode: size.barcode,
        sku: size.sku,

        mrp: size.mrp,
        offerPrice: size.offerPrice,

        countInStock: size.countInStock,

        minOrderQuantity: size.minOrderQuantity,
        maxOrderQuantity: size.maxOrderQuantity,

        location: size.location,

        tax: product.tax || 0,
      };
      break;
    }
  }
}

    return res.json({
      success: true,
      message: "Barcode scanned successfully.",
      // product: response, //we want only scanned variant details, not the whole product
      scannedVariant,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  addProduct,
  updateProductDetails,
  deleteProductById,
  fetchProducts,
  fetchProductById,
  fetchProductByIdByUser,
  fetchAllProducts,
  fetchAllProductsByAdmin,
  productSearch,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
  updateStockCount,
  getLowStockProducts,
  importProducts,
  getProductStockDetails,
  getProductByCategory,
  getProductBySubCategory,
  getProductBySegment,
  deleteProductsByTime,
  getAllProducts,
  getProductsByBrandId,
  subscribeStockNotification,
  getStockNotificationSubscribers,
  bulkSyncAllProductsToStore,
  bulkSyncSelectedProducts,
  scanProductByBarcode,
};
