const crypto = require("crypto");
const BusinessUser = require("../models/model_business_user");

const generateClaimToken = async (businessId, expiryMinutes = 1440) => {
  // 24 hours default
  try {
    const token = crypto.randomBytes(32).toString("hex");

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

    await BusinessUser.findByIdAndUpdate(businessId, {
      claim_token: token,
      claim_token_expiry: expiryDate,
    });

    return {
      claimToken: token,
      expiryDate: expiryDate,
    };
  } catch (error) {
    console.error("Error generating claim token:", error);
    throw new Error("Failed to generate claim token");
  }
};

const validateClaimToken = async (token) => {
  try {
    if (!token) {
      return {
        valid: false,
        message: "Claim token is required",
      };
    }

    // Find user with this token
    const user = await BusinessUser.findOne({
      claim_token: token,
      claim_token_expiry: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      return {
        valid: false,
        message: "Invalid or expired claim token",
      };
    }

    return {
      valid: true,
      user: user,
      message: "Valid claim token",
    };
  } catch (error) {
    console.error("Error validating claim token:", error);
    return {
      valid: false,
      message: "Error validating claim token",
    };
  }
};

const clearClaimToken = async (businessId) => {
  try {
    await BusinessUser.findByIdAndUpdate(businessId, {
      $unset: {
        claim_token: 1,
        claim_token_expiry: 1,
      },
    });
  } catch (error) {
    console.error("Error clearing claim token:", error);
    throw new Error("Failed to clear claim token");
  }
};

module.exports = {
  generateClaimToken,
  validateClaimToken,
  clearClaimToken,
};
