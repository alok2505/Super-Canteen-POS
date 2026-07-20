const express = require("express");
const router = express.Router();
const User = require("../models/userModel.js");

const {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  approveUser,
  getLoginApprovalRequests,
  addUser,
  forgotPassword,
  sendResetOTP,
  changePassword,
  updateAlternativeContactNo,
  getAllBuyers,
  exportUsers,
  bulkImportUsers,
  addMultipleAddresses,
  verifyOtpForAdmin,
  deleteUsersImportedToday,
  getAllBuyersWithPagination,
  updateAddress,
  deleteAddress,
  saveUserToken,
  getCurrentUserAddresses,
  setDefaultAddress,
  deleteImagesFromUpload,
  toggleAvailability,
  getUnavailableMeta,
  sendOtp,
  verifyOtp,
  sendOTPforUserDeletion,
  verifyOTPforUserDeletion
} = require("../controllers/userController.js");

// const { createContactMessage, getAllContactMessages, deleteMultipleContactMessages } = require("../controllers/contactUs.js");

const { authenticate, requireRole, requireActiveFranchise } = require("../middlewares/authMiddleware.js");
const roleMiddleware = require("../middlewares/roleMiddleware.js");

// ------------------------------------
// 🔐 Authentication & Password
// ------------------------------------
router.post("/auth", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/verify-otp-admin", verifyOtpForAdmin);
router.post("/logout", logoutCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/sendResetPassword-otp", sendResetOTP);
router.post("/change-password", authenticate, changePassword);

// ------------------------------------
// 👤 User Registration & Profile
// ------------------------------------
router.post("/signup", createUser);
router.get("/getAllUsers", authenticate, requireRole("Admin","StoreManager"), getAllUsers);

//user Profile get and update 
router.get("/get-profile", authenticate, getCurrentUserProfile)
router.patch("/update-profile", authenticate, updateCurrentUserProfile);
router.get("/get-userProfileAddress", authenticate, getCurrentUserAddresses);

router.post("/update-alternative-contact", updateAlternativeContactNo);
router.post("/save-token", authenticate, saveUserToken); // Save FCM token

// ------------------------------------
// 👥 Admin: User Management
// ------------------------------------
router.post("/add-user", authenticate, requireActiveFranchise, requireRole("Admin","StoreManager"), addUser);
router.patch("/user/approve", authenticate, requireRole("Admin","StoreManager"), approveUser);
router.get("/getLoginApprovalRequests", authenticate, requireRole("Admin","StoreManager"), getLoginApprovalRequests);

// ------------------------------------
// 📦 Buyer/User Listing & Export
// ------------------------------------
router.get("/get-all-buyers", getAllBuyers);
router.get("/get-users", authenticate, requireRole("Admin","StoreManager"), getAllBuyersWithPagination);
router.get("/buyer/get-users-for-export", exportUsers);

// ------------------------------------
// 📥 Bulk Import & Cleanup
// ------------------------------------
router.post("/bulk-import", bulkImportUsers);
router.delete("/imported/delete-today", deleteUsersImportedToday);

// ------------------------------------
// 🏠 Address Management
// ------------------------------------
router.post("/add-Addresses/:userId", authenticate, addMultipleAddresses);
router.patch("/update-AddressByUserId/:userId/address/:addressId", authenticate, updateAddress);
router.post("/set-default-address/:userId", authenticate, setDefaultAddress);
router.delete("/delete-AddressByUserId/:userId/address/:addressId", authenticate, deleteAddress);

//contactUs 
// router.post("/create-contactUs", authenticate, createContactMessage);
// router.get("/get-allContactUs", authenticate, getAllContactMessages);
// router.delete("/delete-multipleContactUs", authenticate, deleteMultipleContactMessages);

//toogleActivity
router.patch("/toggle-availability", authenticate, roleMiddleware(["Admin", "StoreManager"]), toggleAvailability);
//getUnavailableMeta
router.get("/get-unavailable", authenticate, roleMiddleware(["Admin", "StoreManager"]), getUnavailableMeta);


//for user-profile softdeletion
router.post("/sendOTP-forDeletion", sendOTPforUserDeletion);
router.post("/verifyOTP-forDeletion", verifyOTPforUserDeletion);



//other
// router.post("/save-token", saveUserToken);
// router.post("/save-token", async (req, res) => {
//   const { userId, token } = req.body;

//   try {
//     await User.findByIdAndUpdate(userId, { fcmToken: token });
//     res.status(200).json({ message: "FCM token saved!" });
//   } catch (error) {
//     console.error("Failed to save token:", error);
//     res.status(500).json({ error: "Failed to save token" });
//   }
// });


//getUser
router.get("/getUserById/:id", authenticate, requireRole("Admin","StoreManager","Customer"), getUserById)

//updateUserById
router.patch("/updateUserById/:id", authenticate, requireRole("Admin","StoreManager","Customer"), updateUserById)

//deleteUserById
router.delete("/deleteUserById/:id", authenticate, requireRole("Admin","StoreManager"), deleteUserById);


///delete-images from upload folder
router.delete("/delete-imagesFromUpload", authenticate, requireRole("Admin","StoreManager"), deleteImagesFromUpload);


module.exports = router;
