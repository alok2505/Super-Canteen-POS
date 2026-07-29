const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
      default: undefined,
    },
    contactNo: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpire: {
      type: Date,
    },
    alternativeContactNo: {
      type: String,
    },
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
    },
    role: {
      type: String,
      default: "Customer",
    },
    referralCode: {
      type: String,
    },
    canLogin: {
      type: Boolean,
      default: true,
    },
    lastLogin: { type: Date, default: null },

    // CRM Fields
    totalVisits: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },
    lastVisit: { type: Date, default: null },
    dob: { type: Date, default: null },
    anniversary: { type: Date, default: null },
    isFrequent: { type: Boolean, default: false },
    loyaltyPoints: { type: Number, default: 0 },

    fcmToken: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    addresses: [
      {
        name: {
          type: String,
        },
        contactNo: {
          type: String,
        },
        address: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        postalCode: {
          type: String,
        },
        country: {
          type: String,
        },
        addressType: {
          type: String,
          enum: ["Home", "Office", "Other"],
          default: "Home",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        franchiseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Franchise",
        },
        currentLocation: {
          lat: { type: Number },
          lng: { type: Number },
          updatedAt: { type: Date },
        },
      },
    ],
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
