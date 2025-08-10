/**
 * Authentication Handler
 * Centralizes authentication-related logic
 */

const BusinessUser = require("../models/model_business_user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validatePassword, validateEmail } = require("./validation-utils");
const ConstantCtrl = require("./constants.js");
const resObj = require("./response.js");

/**
 * Handles user registration
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise resolving to registration result
 */
const registerUser = async (userData) => {
  try {
    // Validate email
    const emailValidation = validateEmail(userData.user_email);
    if (!emailValidation.isValid) {
      return {
        success: false,
        code: "EmailInvalid",
        message: emailValidation.reason
      };
    }

    // Check if using password-based authentication
    if (userData.user_password) {
      // Validate password
      const passwordValidation = validatePassword(userData.user_password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          code: "PasswordInvalid",
          message: passwordValidation.reason
        };
      }
    }

    // Check if user already exists
    const existingUsers = await BusinessUser.find({ user_email: userData.user_email });
    
    if (existingUsers.length === 0) {
      // Create new user
      if (userData.user_password) {
        // Standard authentication
        const hashPassword = await bcrypt.hash(userData.user_password, 10);
        const newUser = await BusinessUser.create({
          ...userData,
          user_password: hashPassword
        });
        
        newUser.user_password = undefined; // Remove password from response
        const token = generateToken(newUser);
        
        return {
          success: true,
          code: "Registered",
          user: newUser,
          token
        };      } else if (userData.user_gid) {
        // Google authentication
        console.log("Creating new Google user with approved status");
        // Always set user_status to "approved" for Google authentication
        const newUser = await BusinessUser.create({
          ...userData,
          user_status: "approved" // Explicitly ensure this is set
        });
        console.log("Created Google user with status:", newUser.user_status);
        const token = generateToken(newUser);
        
        return {
          success: true,
          code: "Registered",
          user: newUser,
          token
        };      } else if (userData.user_fid) {
        // Facebook authentication
        // Set user_status to "approved" for Facebook authentication
        const newUser = await BusinessUser.create({
          ...userData,
          user_status: "approved"
        });
        const token = generateToken(newUser);
        
        return {
          success: true,
          code: "Registered",
          user: newUser,
          token
        };
      } else {
        return {
          success: false,
          code: "InsufficientDetails",
          message: "Required authentication data missing"
        };
      }
    } else {
      // User exists - handle login cases
      const existingUser = existingUsers[0];
      
      if (userData.user_password && existingUser.user_password) {
        // Standard login
        const isPasswordValid = await bcrypt.compare(userData.user_password, existingUser.user_password);
        
        if (isPasswordValid) {
          existingUser.user_password = undefined; // Remove password from response
          const token = generateToken(existingUser);
          
          return {
            success: true,
            code: "LoggedIn",
            user: existingUser,
            token
          };
        } else {
          return {
            success: false,
            code: "PasswordMismatch",
            message: "Password is incorrect"
          };
        }
      } else if (userData.user_gid && (existingUser.user_gid || !existingUser.user_password)) {
        // Google login - user already exists with Google or doesn't have a password
        console.log("Updating existing user for Google login, ensuring approved status");
        
        // Ensure user status is approved
        if (existingUser.user_status !== "approved") {
          await BusinessUser.updateOne(
            { _id: existingUser._id },
            { $set: { user_status: "approved", user_gid: userData.user_gid } }
          );
          // Refresh user data
          existingUser.user_status = "approved";
          existingUser.user_gid = userData.user_gid;
        }
        
        existingUser.user_password = undefined;
        const token = generateToken(existingUser);
        
        return {
          success: true,
          code: "LoggedIn",
          user: existingUser,
          token
        };
      } else if (userData.user_fid && existingUser.user_fid) {
        // Facebook login - user already exists with Facebook
        existingUser.user_password = undefined;
        const token = generateToken(existingUser);
        
        return {
          success: true,
          code: "LoggedIn",
          user: existingUser,
          token
        };
      } else {
        // Account exists but trying to login with different method
        return {
          success: false,
          code: "ModeMismatch",
          message: "Account exists with different login method"
        };
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      code: "Error",
      message: "An error occurred during authentication"
    };
  }
};

/**
 * Verify user account
 * @param {string} userOid - User object ID
 * @returns {Promise} - Promise resolving to verification result
 */
const verifyAccount = async (userOid) => {
  try {
    const updatedUser = await BusinessUser.findByIdAndUpdate(
      userOid,
      { user_status: "approved" },
      { new: true }
    );
    
    if (!updatedUser) {
      return {
        success: false,
        message: "User not found"
      };
    }
    
    return {
      success: true,
      message: "Account verified successfully"
    };
  } catch (error) {
    console.error("Account verification error:", error);
    return {
      success: false,
      message: "An error occurred during account verification"
    };
  }
};

/**
 * Check if user account is verified
 * @param {string} userEmail - User email
 * @returns {Promise} - Promise resolving to verification status
 */
const isAccountVerified = async (userEmail) => {
  try {
    const user = await BusinessUser.findOne({ user_email: userEmail });
    
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }
    
    return {
      success: true,
      verified: user.user_status === "approved"
    };
  } catch (error) {
    console.error("Verification check error:", error);
    return {
      success: false,
      message: "An error occurred while checking verification status"
    };
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { user_email: user.user_email, userId: user._id },
    ConstantCtrl.JWT_SECRET,
    { expiresIn: "15d" } // Changed from 365d to 15d for better security
  );
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise} - Promise resolving to user data
 */
const getUserById = async (userId) => {
  try {
    const user = await BusinessUser.findById(userId)
      .populate("business_category")
      .populate("business_subcategory")
      .select("-user_password"); // Exclude password
    
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "An error occurred while fetching user data"
    };
  }
};

module.exports = {
  registerUser,
  verifyAccount,
  isAccountVerified,
  getUserById
};
