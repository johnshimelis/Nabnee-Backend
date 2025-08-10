const nodemailer = require("nodemailer");
const ConstantCtrl = require("../utils/constants");
const resObj = require("../utils/response.js");
const mailjetService = require("../services/mailjet-service");
const FCM = require("fcm-push");
require("dotenv").config();
const Promise = require("bluebird");

/**
 * Base Notification class
 * Provides common functionality for all notification types
 */
class Notification {
  constructor() {
    this.mailjetService = mailjetService;
  }

  async send() {
    throw new Error("Method 'send' must be implemented by subclasses");
  }
}

/**
 * OTP Notification class
 * Handles sending OTP verification emails
 */
class OTPNotification extends Notification {
  /**
   * Send OTP email
   * @param {Object} params - Email parameters
   * @param {string} params.email - Recipient email
   * @param {string} params.userName - Recipient name
   * @param {string} params.otpCode - OTP code
   * @param {string} params.language - Email language ('en' or 'ar')
   * @returns {Promise} - Result of sending email
   */
  async send(params) {
    try {
      console.log("Sending OTP notification with params:", {
        email: params.email,
        userName: params.userName,
        language: params.language,
        // Don't log OTP code for security
      });

      const result = await this.mailjetService.sendOtpEmail(
        params.email,
        params.userName || "nabnee User",
        params.otpCode,
        params.language || "en"
      );
      return result;
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw error;
    }
  }
}

/**
 * Password Reset Notification class
 * Handles sending password reset emails
 */
class PasswordResetNotification extends Notification {
  async send(params) {
    try {
      console.log("Sending Password Reset notification with params:", {
        email: params.email,
        userName: params.userName,
        language: params.language,
        // Don't log reset token for security
      });

      // Check if token exists
      if (!params.resetToken) {
        console.error("Missing reset token in password reset notification");
        throw new Error("Missing reset token for password reset");
      }

      const result = await this.mailjetService.sendPasswordResetEmail(
        params.email,
        params.userName || "nabnee User",
        params.resetToken,
        params.language || "en"
      );
      return result;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }
  }
}

class AccountActivationNotification extends Notification {
  async send(params) {
    try {
      console.log("Sending Account Activation notification with params:", {
        email: params.email,
        userName: params.userName,
        language: params.language,
      });

      const result = await this.mailjetService.sendActivationEmail(
        params.email,
        params.userName || "nabnee User",
        params.activationToken,
        params.language || "en"
      );
      return result;
    } catch (error) {
      console.error("Failed to send activation email:", error);
      throw error;
    }
  }
}

/**
 * Business Claim Notification class
 * Handles sending business claim emails
 */
class BusinessClaimNotification extends Notification {
  async send(params) {
    try {
      console.log("Sending Business Claim notification with params:", {
        email: params.email,
        userName: params.userName,
        businessName: params.businessName,
        language: params.language,
        // Don't log claim token for security
      });

      // Check if required parameters exist
      if (!params.claimToken) {
        console.error("Missing claim token in business claim notification");
        throw new Error("Missing claim token for business claim");
      }

      if (!params.businessName) {
        console.error("Missing business name in business claim notification");
        throw new Error("Missing business name for business claim");
      }

      const result = await this.mailjetService.sendBusinessClaimEmail(
        params.email,
        params.userName || "Business Owner",
        params.businessName,
        params.claimToken,
        params.language || "en"
      );
      return result;
    } catch (error) {
      console.error("Failed to send business claim email:", error);
      throw error;
    }
  }
}

/**
 * New Business User Notification class
 * Handles sending welcome emails to new business users
 */
class NewBusinessUserNotification extends Notification {  async send(params) {
    try {
        // Check if required parameters exist
      if (!params.email || !params.password) {
 

        params.email = params.email || ""
        params.password = params.password || "DefaultPassword123";

      }

      if (!params.businessName) {
        params.businessName = "Your Business";
      }

      const result = await this.mailjetService.sendNewBusinessUserEmail(
        params.email,
        params.userName || "Business Owner",
        params.businessName,
        params.email,
        params.password,
        params.loginUrl || "https://nabnee.com/login",
        params.language || "en"
      );
      return result;
    } catch (error) {
      console.error("Failed to send new business user email:", error);
      throw error;
    }
  }
}

// Factory class to create the appropriate notification type
class NotificationFactory {
  static createNotification(type) {
    switch (type) {
      case "otp":
      case "otp_verification":
      case "otp_verification_ar":
        return new OTPNotification();

      case "password_reset":
      case "forgotpassword":
      case "forgotpassword_ar":
        return new PasswordResetNotification();

      case "activation":
      case "account_activation":
      case "account_activation_ar":
        return new AccountActivationNotification();      case "business_claim":
      case "business_claim_ar":
        return new BusinessClaimNotification();

      case "new_business_user":
      case "new_business_user_ar":
      case "newbusinessuser":
      case "newbusinessuserprofile":
      case "newbusinessuserprofile_ar":
        return new NewBusinessUserNotification();

      default:
        // Default to OTP notification for backward compatibility
        console.warn(
          `Unknown notification type: ${type}, defaulting to OTP notification`
        );
        return new OTPNotification();
    }
  }
}

/**
 * Main send_mail function used by existing code
 * Acts as a facade to the new class-based system
 */
module.exports.send_mail = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {      const {
        email,
        user_name,        user_public_name,
        subject_body,
        type,
        otp_code,
        reset_token,
        reset_id, // For backward compatibility
        activation_token,
        business_name,
        claim_token,
        language = "en",
        user_language, // Also check for user_language
        username, // For business user profile email
        password, // For business user profile email
        loginUrl, // For business user profile email
      } = req.body;
      
      // Use user_language if provided, otherwise fallback to language
      const effectiveLanguage = user_language || language;

      console.log("send_mail called with req.body:", req.body);

      if (!email) {
        if (resolve) {
          resolve(
            resObj.content_operation_responses("Error", "Email is required")
          );
        }
        return;
      }

      try {
        // Determine notification type and create appropriate notification object
        const notificationType =
          type ||
          (otp_code
            ? "otp"
            : reset_token || reset_id
              ? "password_reset"
              : "otp");
        const notification =
          NotificationFactory.createNotification(notificationType);

        // Set up parameters based on notification type
        let params = {
          email: email,
          userName: user_public_name || user_name || "nabnee User",
          language: language,
        };        // Add type-specific parameters
        if (
          notificationType.includes("password_reset") ||
          reset_token ||
          reset_id
        ) {
          params.resetToken = reset_token || reset_id;
        } else if (
          notificationType.includes("activation") ||
          activation_token
        ) {
          params.activationToken = activation_token;        } else if (
          notificationType.includes("business_claim") ||
          claim_token
        ) {
          params.businessName = business_name;
          params.claimToken = claim_token;
        } else if (
          notificationType.includes("newbusinessuser") ||
          notificationType.includes("new_business_user")
        ) {
          params.businessName = business_name;
          params.email = email;
          params.password = password;
          params.loginUrl = loginUrl || "https://nabnee.com/login";
        } else {
          params.otpCode = otp_code;
        }

        // Send the notification
        const result = await notification.send(params);

        if (resolve) {
          resolve(resObj.content_operation_responses("Success", result));
        }
        return result;      } catch (error) {
        console.error("Notification failed:", error);

        if (resolve) {
          resolve(
            resObj.content_operation_responses(
              "Error",
              error.message || "Failed to send notification"
            )
          );
        }
        return { success: false, error: error.message };
      }
    } catch (error) {
      if (resolve) {
        resolve(resObj.content_operation_responses("Error", error.message));
      }
      return { success: false, error: error.message };
    }
  });
};


module.exports.send_notification = function (req, res) {
  return new Promise(function (resolve, reject) {
    let serverKey = ConstantCtrl.notification_vitals.server_key;
    let fcm = new FCM(serverKey);
    let notif = {};
    notif = {
      to: req.body.fcm_token,
      data: {
        todo: req.body.notif_todo,
        title: req.body.notif_title,
        message: req.body.notif_message,
        img: req.body.notif_img,
        thumbnail: req.body.notif_thumbnail,
        browser_condition: ConstantCtrl.notification_vitals.browser_condition,
        target: req.body.notif_link,
        sender_id: req.body.sender_id,
      },
    };
    fcm.send(notif, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!");
        console.log(err);
        resolve(resObj.notification_operation_responses("NotificationNotSent"));
      } else {
        console.log("Successfully sent with response: ", response);
        resolve(resObj.notification_operation_responses("NotificationSent"));
      }
    });
  });
};
