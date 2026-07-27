const { privateDecrypt } = require("crypto");
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      // required: true, // Made optional for OTP based login
    },
    email: {
      type: String,
      // required: true, //  mandatory -> Made optional
      unique: true, // no duplicates (ensure index is dropped first) -> Handled by sparse
      lowercase: true,
      sparse: true, // Ensures uniqueness only for non-null emails
      default: null, //Stores null instead of an empty string
    },
    password: {
      type: String,
      // required: function () {
      //   // Only required if the document is newly created
      //   return this.isNew;
      // },
      // Made optional for OTP flow
    },
    contactNo: {
      type: String,
      required: function () {
        return this.role === 'Customer';
      },
      unique: true, // crucial for phone-based auth
      sparse: true
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
    //new
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
    },
    role: {
      type: String,
      enum: ["Admin", "Customer","WarehouseManager", "StoreManager","InventoryStaff", "PackingStaff"],
    },
    referralCode: {
      type: String,
    },
    canLogin: {
      type: Boolean,
      default: true,
    },
    lastLogin: { type: Date, default: null }, // Track last login

    // ==========================================
    // CRM Fields (Used if role === "Customer")
    // ==========================================
    totalVisits: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },
    lastVisit: { type: Date, default: null },
    dob: { type: Date, default: null },
    anniversary: { type: Date, default: null },
    isFrequent: { type: Boolean, default: false },
    loyaltyPoints: { type: Number, default: 0 },
    // ==========================================

    shopName: {
      type: String,
    },
    gstIn: {
      type: String,
    },
    dist: {
      type: String,
    },
    userId: {
      type: String,
    },
    fcmToken: {
      type: String
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
    // null = self registered (Customer) or created by system (Admin)
    // ObjectId = StoreManager who created this InventoryStaff/PackingStaff
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
          type: String
        },
        city: {
          type: String
        },
        state: {
          type: String
        },
        postalCode: {
          type: String
        },
        country: {
          type: String
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
        // Per-address geo location
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

userSchema.pre('save', async function() {
  if (this.role === 'WarehouseManager' && this.franchiseId) {
    const Franchise = mongoose.model('Franchise');
    const franchise = await Franchise.findById(this.franchiseId);
    
    if (!franchise) {
      throw new Error('Franchise not found');
    }
    if (franchise.type !== 'Warehouse') {
      throw new Error('WarehouseManager must be assigned to a Warehouse franchise');
    }
  }
});

var User = mongoose.model("User", userSchema);

module.exports = User;