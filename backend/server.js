const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const formidable = require("express-formidable");



dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
const productRoutes = require("./routes/productRoutes");
const billingRoutes = require("./routes/billingRoutes");
const billRoutes = require("./routes/billRoutes");
const holdBillRoutes = require("./routes/holdBillRoutes");


app.use("/api/products",productRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/hold-bills", holdBillRoutes);

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