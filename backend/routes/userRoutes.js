// ============================================================
// userRoutes.js — Authentication, user management, and profile endpoints
// ============================================================
// This file handles everything related to users:
//   • Login / OTP / password reset (public — no auth needed)
//   • Profile management (requires login)
//   • Admin: managing all users across the system
//   • StoreManager: managing Staff within their own franchise
//   • Address book management (customer feature)
// ============================================================

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
  verifyOTPforUserDeletion,
} = require("../controllers/userController.js");

const {
  authenticate,
  requireRole,
  requireActiveFranchise,
} = require("../middlewares/authMiddleware.js");

const roleMiddleware = require("../middlewares/roleMiddleware.js");

const {
  ADMIN_ONLY,
  ADMIN_AND_MANAGER,
} = require("../utils/roleConstants");

// ============================================================
// 🔐 Authentication & Password — PUBLIC routes (no token needed)
// ============================================================

// POST /users/auth — Email/password login, returns JWT
router.post("/auth", loginUser);

// POST /users/send-otp — Sends a one-time password to a mobile number
router.post("/send-otp", sendOtp);

// POST /users/verify-otp — Verifies OTP and returns JWT (customer login)
router.post("/verify-otp", verifyOtp);

// POST /users/verify-otp-admin — OTP verification for Admin/staff accounts
router.post("/verify-otp-admin", verifyOtpForAdmin);

// POST /users/logout — Clears the JWT cookie (browser clients)
router.post("/logout", logoutCurrentUser);

// POST /users/forgot-password — Triggers a password reset flow
router.post("/forgot-password", forgotPassword);

// POST /users/sendResetPassword-otp — Sends OTP for password reset verification
router.post("/sendResetPassword-otp", sendResetOTP);

// POST /users/change-password — Allows a logged-in user to change their password
// Requires authentication — user must be logged in to change their own password
router.post("/change-password", authenticate, changePassword);

// ============================================================
// 👤 User Registration & Profile — Authenticated routes
// ============================================================

// POST /users/signup — Self-registration (for Customers)
// Public — no auth needed; Customers create their own accounts
router.post("/signup", createUser);

// GET /users/getAllUsers — Returns paginated list of users
// Admin sees all users; StoreManager sees users in their franchise
router.get(
  "/getAllUsers",
  authenticate,
  requireRole(...ADMIN_AND_MANAGER),
  getAllUsers
);

// GET /users/get-profile — Returns the logged-in user's own profile
router.get("/get-profile", authenticate, getCurrentUserProfile);

// PATCH /users/update-profile — Updates the logged-in user's own profile fields
router.patch("/update-profile", authenticate, updateCurrentUserProfile);

// GET /users/get-userProfileAddress — Returns the logged-in user's address book
router.get("/get-userProfileAddress", authenticate, getCurrentUserAddresses);

// POST /users/update-alternative-contact — Updates an alternative phone number
// No auth required — used during OTP flows before login completes
router.post("/update-alternative-contact", updateAlternativeContactNo);

// POST /users/save-token — Saves an FCM push notification token for this device
router.post("/save-token", authenticate, saveUserToken);

// ============================================================
// 👥 User Management — Admin and StoreManager
// ============================================================

// POST /users/add-user
// Creates a new user and optionally assigns them to a franchise.
//
// Separation of concerns:
//   • Admin calls this to create StoreManagers (assigns them to a franchise).
//     Admin should NOT use this to create Staff — that is the StoreManager's job.
//   • StoreManager calls this to create InventoryStaff for THEIR OWN franchise only.
//     The controller must validate that a StoreManager only assigns users
//     to their own franchiseId — not to other franchises.
//
// requireActiveFranchise ensures the target franchise is active before adding staff.
router.post(
  "/add-user",
  authenticate,
  requireActiveFranchise,
  requireRole(...ADMIN_AND_MANAGER),
  addUser
);

// PATCH /users/user/approve
// Approves a user account that is pending login approval.
// Admin approves globally; StoreManager approves within their franchise.
router.patch(
  "/user/approve",
  authenticate,
  requireRole(...ADMIN_AND_MANAGER),
  approveUser
);

// GET /users/getLoginApprovalRequests
// Lists users who are waiting for approval to log in.
// Admin sees all pending requests; StoreManager sees their franchise's requests.
router.get(
  "/getLoginApprovalRequests",
  authenticate,
  requireRole(...ADMIN_AND_MANAGER),
  getLoginApprovalRequests
);

// ============================================================
// 📦 Buyer / Customer Listing & Export
// ============================================================

// GET /users/get-all-buyers — Public buyer list (no auth)
router.get("/get-all-buyers", getAllBuyers);

// GET /users/get-users — Paginated customer list with filters
// Admin and StoreManager can view customers (for order history, support)
router.get(
  "/get-users",
  authenticate,
  requireRole(...ADMIN_AND_MANAGER),
  getAllBuyersWithPagination
);

// GET /users/buyer/get-users-for-export — CSV/Excel export of users
// No auth guard here — restrict at network/IP level in production if needed
router.get("/buyer/get-users-for-export", exportUsers);

// ============================================================
// 📥 Bulk Import & Cleanup — Admin only
// ============================================================

// POST /users/bulk-import — Imports multiple users from a CSV/JSON payload
router.post("/bulk-import", bulkImportUsers);

// DELETE /users/imported/delete-today — Deletes all users imported today
// Useful for rolling back a bad import session
router.delete("/imported/delete-today", deleteUsersImportedToday);

// ============================================================
// 🏠 Address Management — Authenticated users manage their own addresses
// ============================================================

// POST /users/add-Addresses/:userId — Adds one or more addresses for a user
router.post("/add-Addresses/:userId", authenticate, addMultipleAddresses);

// PATCH /users/update-AddressByUserId/:userId/address/:addressId — Updates one address
router.patch(
  "/update-AddressByUserId/:userId/address/:addressId",
  authenticate,
  updateAddress
);

// POST /users/set-default-address/:userId — Marks an address as the default shipping address
router.post("/set-default-address/:userId", authenticate, setDefaultAddress);

// DELETE /users/delete-AddressByUserId/:userId/address/:addressId — Removes one address
router.delete(
  "/delete-AddressByUserId/:userId/address/:addressId",
  authenticate,
  deleteAddress
);

// ============================================================
// 🔄 Availability & Metadata — Admin and StoreManager
// ============================================================

// PATCH /users/toggle-availability
// Marks a user or product as unavailable/available (used for scheduling).
// Admin and StoreManager can toggle availability.
router.patch(
  "/toggle-availability",
  authenticate,
  roleMiddleware(["Admin", "StoreManager"]),
  toggleAvailability
);

// GET /users/get-unavailable
// Returns a list of currently unavailable users or resources.
// Admin and StoreManager can view this for scheduling purposes.
router.get(
  "/get-unavailable",
  authenticate,
  roleMiddleware(["Admin", "StoreManager"]),
  getUnavailableMeta
);

// ============================================================
// 🗑️ User Self-Deletion Flow — Public OTP-based
// ============================================================

// POST /users/sendOTP-forDeletion — Sends OTP to verify identity before account deletion
router.post("/sendOTP-forDeletion", sendOTPforUserDeletion);

// POST /users/verifyOTP-forDeletion — Verifies OTP and soft-deletes the user account
router.post("/verifyOTP-forDeletion", verifyOTPforUserDeletion);

// ============================================================
// 🔎 Individual User CRUD — By ID
// ============================================================

// GET /users/getUserById/:id
// Retrieves a user's full profile by their MongoDB ID.
// Admin, StoreManager, and the user themselves (Customer) can access this.
router.get(
  "/getUserById/:id",
  authenticate,
  requireRole("Admin", "StoreManager", "Customer"),
  getUserById
);

// PATCH /users/updateUserById/:id
// Updates any field on a user account by their ID.
// Admin, StoreManager, and the user themselves can update their own profile.
router.patch(
  "/updateUserById/:id",
  authenticate,
  requireRole("Admin", "StoreManager", "Customer"),
  updateUserById
);

// DELETE /users/deleteUserById/:id
// Permanently deletes a user account.
// Admin only — only Admin manages the lifecycle of StoreManagers and system users.
// StoreManager should DEACTIVATE staff (status: Inactive), not delete them,
// to preserve audit history. Hard deletion is a superuser-only action.
router.delete(
  "/deleteUserById/:id",
  authenticate,
  requireRole(...ADMIN_ONLY),
  deleteUserById
);

// DELETE /users/delete-imagesFromUpload
// Cleans up orphaned image files from the upload folder.
// Admin and StoreManager can trigger this cleanup.
router.delete(
  "/delete-imagesFromUpload",
  authenticate,
  requireRole(...ADMIN_AND_MANAGER),
  deleteImagesFromUpload
);

module.exports = router;
