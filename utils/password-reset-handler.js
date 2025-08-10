/**
 * Password Reset Handler
 * Manages password reset token generation and validation
 */

const crypto = require("crypto");
const mongoose = require("mongoose");
const BusinessUser = require("../models/model_business_user");

/**
 * Generates a random token for password reset
 * @returns {string} - Random token string
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Creates and stores a password reset token for a user
 * @param {string} userEmail - Email of the user requesting password reset
 * @param {number} expiryMinutes - Minutes until token expires (default: 60)
 * @returns {Promise<Object>} - Object containing reset token and expiry date
 */
const createResetToken = async (userEmail, expiryMinutes = 60) => {
  try {
    // Generate a new reset token
    const resetToken = generateToken();

    // Calculate expiry date (current time + expiryMinutes)
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Update user with new reset token and expiry
    await BusinessUser.updateOne(
      { user_email: userEmail },
      {
        password_reset_token: resetToken,
        password_reset_expiry: expiryDate,
      }
    );

    return {
      resetToken,
      expiryDate,
    };
  } catch (error) {
    console.error("Error creating reset token:", error);
    throw error;
  }
};

/**
 * Validates a password reset token
 * @param {string} token - Password reset token to validate
 * @returns {Promise<Object>} - Object containing validation result and user data if valid
 */
const validateResetToken = async (token) => {
  try {
    // Find user with matching reset token that hasn't expired
    const user = await BusinessUser.findOne({
      password_reset_token: token,
      password_reset_expiry: { $gt: new Date() }, // Ensure token hasn't expired
    });

    if (!user) {
      return {
        valid: false,
        message: "Invalid or expired reset token. Please request a new password reset.",
      };
    }

    return {
      valid: true,
      user,
    };
  } catch (error) {
    console.error("Error validating reset token:", error);
    return {
      valid: false,
      message: "Error validating reset token",
    };
  }
};

/**
 * Clears the password reset token and expiry for a user
 * @param {string} userEmail - Email of the user to clear token for
 * @returns {Promise<boolean>} - True if successful
 */
const clearResetToken = async (userEmail) => {
  try {
    await BusinessUser.updateOne(
      { user_email: userEmail },
      {
        password_reset_token: null,
        password_reset_expiry: null,
      }
    );
    return true;
  } catch (error) {
    console.error("Error clearing reset token:", error);
    return false;
  }
};

module.exports = {
  generateToken,
  createResetToken,
  validateResetToken,
  clearResetToken,
};
