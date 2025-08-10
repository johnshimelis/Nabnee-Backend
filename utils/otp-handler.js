const mongoose = require("mongoose");
const BusinessUser = require("../models/model_business_user");

/**
 * Generates a random n-digit OTP code
 * @param {number} length - Length of the OTP code (default: 6)
 * @returns {string} - Generated OTP code
 */

const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
};

/**
 * Stores an OTP code for a user
 * @param {string} userId - User ID or email to store OTP for
 * @param {number} expiryMinutes - Minutes until OTP expires (default: 10)
 * @returns {Promise<Object>} - Object containing OTP code and expiry date
 */
const storeOTP = async (userId, expiryMinutes = 10) => {
  try {
    // Generate a new OTP code
    const otpCode = generateOTP();

    // Calculate expiry date (current time + expiryMinutes)
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Check if userId is an email or ID
    const searchQuery = mongoose.Types.ObjectId.isValid(userId)
      ? { _id: userId }
      : { user_email: userId };

    // Update user with new OTP and expiry
    await BusinessUser.updateOne(searchQuery, {
      otp_code: otpCode,
      otp_expiry: expiryDate,
      otp_verified: false,
    });

    return {
      otpCode,
      expiryDate,
    };
  } catch (error) {
    console.error("Error storing OTP:", error);
    throw error;
  }
};

/**
 * Verifies an OTP code for a user
 * @param {string} userId - User ID or email to verify OTP for
 * @param {string} otpCode - OTP code to verify
 * @returns {Promise<boolean>} - True if verification successful, false otherwise
 */
const verifyOTP = async (userId, otpCode) => {
  try {
    // Check if userId is an email or ID
    const searchQuery = mongoose.Types.ObjectId.isValid(userId)
      ? { _id: userId }
      : { user_email: userId };

    // Find user with matching OTP and check expiry
    const user = await BusinessUser.findOne({
      ...searchQuery,
      otp_code: otpCode,
      otp_expiry: { $gt: new Date() }, // Ensure OTP hasn't expired
    });

    if (!user) {
      return false;
    }

    // Update user to mark OTP as verified and update status
    await BusinessUser.updateOne(
      { _id: user._id },
      {
        user_status: "approved",
        otp_verified: true,
        otp_code: null, // Clear the OTP code after successful verification
      }
    );

    return true;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
};
