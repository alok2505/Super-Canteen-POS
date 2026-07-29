const fs = require('fs');
const customerControllerPath = '/Users/alokkumar/Desktop/Super Canteen POS/backend/controllers/customerController.js';
const userControllerPath = '/Users/alokkumar/Desktop/Super Canteen POS/backend/controllers/userController.js';

let customerCode = fs.readFileSync(customerControllerPath, 'utf8');
let userCode = fs.readFileSync(userControllerPath, 'utf8');

// The functions to move
const createUserStr = `var createCustomer = asyncHandler(async function (req, res) {
  try {
    const { username, email, password, contactNo } = req.body;

    // Validation to check required fields
    if (!username || !email || !password || !contactNo) {
      throw new Error("Please fill all the required inputs, including contact number.");
    }
    // Check if the user already exists
    const userExists = await Customer.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //userId
    const userCount = await Customer.countDocuments();
    const userId = (userCount + 1).toString();

    // Create a new user with the updated model
    const newUser = new Customer({
      userId,
      username,
      email,
      contactNo,
      password: hashedPassword,
      role: "Customer",
    });

    //saved User
    await newUser.save();

    // Create token for authentication
    const token = createToken(res, newUser._id);

    res.status(200).json({
      message: "Registration successfull!",
      userId: newUser._id,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Something Went Wrong While SignUp!" });
  }
});`;

const sendOtpStr = `const sendOtp = asyncHandler(async (req, res) => {
  const { contactNo } = req.body;

  if (!contactNo) {
    return res.status(400).json({ message: "Contact number is required." });
  }

  // 1. Check if user exists
  let user = await Customer.findOne({ contactNo });

  // 2. Generate OTP
  const otp = generateSmsOtp();
  const otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins

  if (!user) {
    const userCount = await Customer.countDocuments();
    const userID = userCount + 1; // Simple increment

    user = new Customer({
      contactNo,
      role: "Customer",
      otp,
      otpExpire,
      userId: userID.toString(), // userModel uses string for userId
      status: "Active"
    });
  } else {
    // 3b. Update existing user
    user.otp = otp;
    user.otpExpire = otpExpire;
  }

  await user.save();

  // 4. Send SMS
  try {
    await sendOtpSms({ mobile: contactNo, otp });
    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send SMS.", error: error.message });
  }
});`;

const verifyOtpStr = `const verifyOtp = asyncHandler(async (req, res) => {
  const { contactNo, otp } = req.body;

  if (!contactNo || !otp) {
    return res.status(400).json({ message: "Contact number and OTP are required." });
  }

  const user = await Customer.findOne({ contactNo });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

    //Restrict inactive/deleted users
  if (user.status === "Inactive") {
    return res.status(403).json({
      success: false,
      message:
        "Your account has been deactivated. Please contact support.",
    });
  }


  // Bypass OTP for testing
  if (
    contactNo === "7566675667" &&
    otp === "123456" ||  contactNo === "9098084055" &&
    otp === "123456"
  ) {
    user.otp = undefined;
    user.otpExpire = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = createToken(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful (bypass OTP).",
      token,
      user: {
        _id: user._id,
        contactNo: user.contactNo,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  }

  // Normal OTP validation
  if (user.otp === otp && user.otpExpire > Date.now()) {
    user.otp = undefined;
    user.otpExpire = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = createToken(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        contactNo: user.contactNo,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }
});`;

// Remove from userController
userCode = userCode.replace(/var createUser = asyncHandler\(async function \(req, res\) \{[\s\S]*?\}\);\n\n/, "");
userCode = userCode.replace(/\/\/ Send OTP \(Customers\)[\s\S]*?const sendOtp = asyncHandler\(async \(req, res\) => \{[\s\S]*?\}\);\n\n/, "");
userCode = userCode.replace(/const verifyOtp = asyncHandler\(async \(req, res\) => \{[\s\S]*?\}\);\n\n/, "");

// Clean up exports in userController
userCode = userCode.replace("  createUser,\n", "");
userCode = userCode.replace("  sendOtp,\n", "");
userCode = userCode.replace("  verifyOtp,\n", "");

fs.writeFileSync(userControllerPath, userCode);

// Add to customerController
customerCode = customerCode.replace('const User = require("../models/userModel");', 'const Customer = require("../models/customerModel");\nconst bcrypt = require("bcryptjs");\nconst createToken = require("../utils/createToken.js");\nconst { generateSmsOtp, sendOtpSms } = require("../utils/sms.service.js");\n');
customerCode = customerCode.replace(/User\.find/g, 'Customer.find');
customerCode = customerCode.replace(/User\.create/g, 'Customer.create');
customerCode = customerCode.replace(/role: "Customer"/g, ''); // we don't need role customer because it's a dedicated collection, but leaving it as empty string might leave dangling commas. Let's handle it better.

customerCode = customerCode.replace(/\{ role: "Customer" \}/g, "{}");
customerCode = customerCode.replace(/, role: "Customer"/g, "");
customerCode = customerCode.replace(/role: "Customer",/g, "");

customerCode += "\n" + createUserStr + "\n\n" + sendOtpStr + "\n\n" + verifyOtpStr + "\n";
customerCode = customerCode.replace("module.exports = {", "module.exports = {\n  createCustomer,\n  sendOtp,\n  verifyOtp,");
fs.writeFileSync(customerControllerPath, customerCode);

console.log("Done");
