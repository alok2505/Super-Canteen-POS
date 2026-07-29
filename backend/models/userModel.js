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
      required: true,
      unique: true, // no duplicates (ensure index is dropped first) -> Handled by sparse
      lowercase: true,
      sparse: true, // Ensures uniqueness only for non-null emails
      default: null, //Stores null instead of an empty string
    },
    password: {
      type: String,
      
    },
    contactNo: {
      type: String,
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
      enum: ["Admin", "WarehouseManager", "StoreManager","InventoryStaff", "PackingStaff"],
    },
    referralCode: {
      type: String,
    },
    canLogin: {
      type: Boolean,
      default: true,
    },
    lastLogin: { type: Date, default: null }, // Track last login

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
    },
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