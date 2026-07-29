const fs = require('fs');

const userControllerPath = '/Users/alokkumar/Desktop/Super Canteen POS/backend/controllers/userController.js';
let userCtrl = fs.readFileSync(userControllerPath, 'utf8');

// 1. Remove createUser from userController
const createUserRegex = /var createUser = asyncHandler\(async function \(req, res\) \{[\s\S]*?\}\);\n\n/;
const createUserMatch = userCtrl.match(createUserRegex);
let createUserCode = "";
if (createUserMatch) {
  createUserCode = createUserMatch[0];
  userCtrl = userCtrl.replace(createUserMatch[0], '');
}

// 2. Remove sendOtp from userController
const sendOtpRegex = /\/\/ Send OTP \(Customers\)\nconst sendOtp = asyncHandler\(async \(req, res\) => \{[\s\S]*?\}\);\n\n/;
const sendOtpMatch = userCtrl.match(sendOtpRegex);
let sendOtpCode = "";
if (sendOtpMatch) {
  sendOtpCode = sendOtpMatch[0];
  userCtrl = userCtrl.replace(sendOtpMatch[0], '');
}

// 3. Remove verifyOtp from userController
const verifyOtpRegex = /\/\/ Verify OTP \(Customers\) \/\/real for production\n\/\/ const verifyOtp[\s\S]*?const verifyOtp = asyncHandler\(async \(req, res\) => \{[\s\S]*?\}\);\n\n/;
const verifyOtpMatch = userCtrl.match(verifyOtpRegex);
let verifyOtpCode = "";
if (verifyOtpMatch) {
  verifyOtpCode = verifyOtpMatch[0];
  userCtrl = userCtrl.replace(verifyOtpMatch[0], '');
}

// Write updated userController back
fs.writeFileSync(userControllerPath, userCtrl);

// 4. Update customerController
const customerControllerPath = '/Users/alokkumar/Desktop/Super Canteen POS/backend/controllers/customerController.js';
let customerCtrl = fs.readFileSync(customerControllerPath, 'utf8');

// replace User requires with Customer
customerCtrl = customerCtrl.replace('const User = require("../models/userModel");', 'const Customer = require("../models/customerModel");\nconst bcrypt = require("bcryptjs");\nconst createToken = require("../utils/createToken");\nconst { generateSmsOtp, sendOtpSms } = require("../utils/sms.service");');
customerCtrl = customerCtrl.replace(/User\./g, 'Customer.');
customerCtrl = customerCtrl.replace(/role: "Customer"/g, ''); // no longer need this in queries

// add the auth functions
let newFunctions = `
// ==========================================
// Customer Auth Functions
// ==========================================
${createUserCode.replace(/User/g, 'Customer')}

${sendOtpCode.replace(/User/g, 'Customer').replace('const userCount = await Customer.countDocuments();\n    const userID = userCount + 1;\n\n    user = new Customer({\n      contactNo,\n      role: "Customer",\n      otp,\n      otpExpire,\n      userId: userID.toString(),\n      status: "Active"\n    });', 'const userCount = await Customer.countDocuments();\n    const userID = userCount + 1;\n\n    user = new Customer({\n      contactNo,\n      otp,\n      otpExpire,\n      userId: userID.toString(),\n      status: "Active"\n    });')}

${verifyOtpCode.replace(/User/g, 'Customer')}
`;

customerCtrl = customerCtrl.replace('module.exports = {', newFunctions + 'module.exports = {\n  createUser,\n  sendOtp,\n  verifyOtp,');
fs.writeFileSync(customerControllerPath, customerCtrl);

console.log("Refactor script complete!");
