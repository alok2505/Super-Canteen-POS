const User = require("../models/userModel.js");

const getNextUserId = async () => {
  try {
    // Generate a simple unique ID based on timestamp
    const count = await User.countDocuments();
    return `USR${Date.now()}${count + 1}`;
  } catch (error) {
    return `USR${Date.now()}`;
  }
};

module.exports = { getNextUserId };
