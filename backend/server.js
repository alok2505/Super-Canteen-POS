const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const formidable = require("express-formidable");
const cookieParser = require("cookie-parser");



dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
const productRoutes = require("./routes/productRoutes");
const billingRoutes = require("./routes/billingRoutes");
const billRoutes = require("./routes/billRoutes");
const holdBillRoutes = require("./routes/holdBillRoutes");
const userRoutes = require("./routes/userRoutes");
const franchiseRoutes = require("./routes/franchiseRoutes");
const masterProductRoutes = require("./routes/masterProductRoutes");
const franchiseInventoryRoutes = require("./routes/franchiseInventoryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const reportRoutes = require("./routes/reportRoutes");
const returnRoutes = require("./routes/returnRoutes");
const customerRoutes = require("./routes/customerRoutes");
const offerRoutes = require("./routes/offerRoutes");


app.use("/api/products",productRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/franchises", franchiseRoutes);
app.use("/api/master-products", masterProductRoutes);
app.use("/api/franchise-inventory", franchiseInventoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/hold-bills", holdBillRoutes);
app.use("/api/reports", reportRoutes);
// Default Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Super Canteen POS API Running",
  });
});

// Global Error Handler for unhandled errors (e.g. Multer/Cloudinary)
app.use((err, req, res, next) => {
  console.error("Global Error Middleware:", err);
  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  // Cloudinary often throws errors with `.message`
  res.status(500).json({ 
    success: false, 
    message: err.message || "Internal Server Error"
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `Server running on port ${process.env.PORT || 3000}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
