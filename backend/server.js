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


app.use("/api/products",productRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/hold-bills", holdBillRoutes);
app.use("/api/users", userRoutes);
app.use("/api/franchises", franchiseRoutes);
app.use("/api/master-products", masterProductRoutes);
app.use("/api/franchise-inventory", franchiseInventoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);

// Default Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Super Canteen POS API Running",
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
