let Promise = require("bluebird");
let dbhandler = require("../utils/dbhandler.js");
let resObj = require("../utils/response.js");
let bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const BusinessUser = require("../models/model_business_user.js");
const {
  validateEmail,
  validatePassword,
} = require("../utils/validation-utils.js");
const usernameUtils = require("../utils/username-utils.js");
const authHandler = require("../utils/auth-handler.js");
const notifCtrl = require("./notification_controller.js");
///////////// User Content //////////////////////////////////////////////////

module.exports.create_user = function (req, res) {
  return new Promise(async function (resolve, reject) {
    const sendEmailRaw = req.body.send_email;
    const sendEmail =
      sendEmailRaw === true ||
      sendEmailRaw === "true" ||
      sendEmailRaw === "1" ||
      sendEmailRaw === 1;

    if (req.body.user_email) {
      // Generate a base username from email
      let baseUsername = req.body.user_public_name;
      if (!baseUsername) {
        baseUsername = usernameUtils.generateUniqueUsername(
          req.body.user_email
        );
      }

      // Check if username already exists
      let username = baseUsername;
      let counter = 1;
      let usernameExists = true;
      while (usernameExists) {
        try {
          const existingUser = await BusinessUser.findOne({
            user_public_name: username,
          });
          if (!existingUser) {
            usernameExists = false;
          } else {
            username = `${baseUsername}${counter}`;
            counter++;
          }
        } catch (error) {
          break;
        }
      }

      req.body.user_public_name = username;
      dbhandler
        .find_business_user(req.body.user_email)
        .then(async (resp) => {
          if (resp.length === 0) {
            console.log(
              "✨ [Google Registration Debug] No existing user found - creating new user"
            );
            if (
              req.body.user_email &&
              req.body.user_password &&
              req.body.user_public_name
            ) {
              // Validate password
              const passwordValidation = validatePassword(
                req.body.user_password
              );
              if (!passwordValidation.isValid) {
                resolve(
                  resObj.register_resp(
                    "PasswordInvalid",
                    passwordValidation.reason
                  )
                );
                return;
              }

              // Generate custom URL from public name if not provided
              let customUrl = req.body.custom_url;
              if (!customUrl && req.body.user_public_name) {
                customUrl = sanitizeCustomUrl(req.body.user_public_name);
                const urlValidation = validateCustomUrl(customUrl);
                if (!urlValidation.isValid) {
                  customUrl = null;
                }
              }
              dbhandler
                .create_business_user_simple(
                  req.body.user_type,
                  req.body.user_public_name,
                  req.body.user_email,
                  req.body.user_password,
                  req.body.user_fcm,
                  customUrl,
                  (whoCreated = "admin"),
                  req.body.noofquotes || 5,
                  req.body.max_hashtags || 5,
                  req.body.business_hours || [],
                  req.body.leisure_hours || [],
                  req.body.logo,
                  req.body.cover_image,
                  "", // cover_image_title_english
                  "", // cover_image_title_arabic
                  "", // cover_image_description_english
                  "", // cover_image_description_arabic
                  req.body.business_name,
                  req.body.business_name_english,
                  req.body.business_name_ar,
                  req.body.business_description,
                  req.body.business_description_ar,
                  req.body.business_email,
                  req.body.business_phone,
                  req.body.business_website,
                  req.body.business_address,
                  req.body.business_address_ar,
                  req.body.business_city,
                  req.body.business_category,
                  req.body.business_subcategories,
                  req.body.user_status || "pending",
                  req.body.business_type,
                  req.body.user_country,
                  req.body.fb_link,
                  req.body.instagram_link,
                  req.body.youtube_link,
                  req.body.twitter_link,
                  req.body.web_link,
                  req.body.address,
                  req.body.address_ar,
                  req.body.location_lat,
                  req.body.location_long,
                  req.body.branch_name,
                  req.body.branch_name_ar
                )
                .then(async (userResponse) => {
                  try {
                    if (
                      userResponse.success &&
                      userResponse.user_details &&
                      userResponse.user_details.length > 0
                    ) {
                      const userContent = userResponse.user_details[0];
                      const userId = userContent._id;

                      // Determine if this is an admin-created account
                      // The send_email flag is used to indicate that this is an admin-created account
                      // and that we should send the welcome email with credentials
                      const isCreatedByAdmin = sendEmail;

                      const notifCtrl = require("./notification_controller.js");
                      let otpData = null;

                      // Only store OTP for self-registered users, NOT admin-created users
                      if (!isCreatedByAdmin) {
                        const otpHandler = require("../utils/otp-handler.js");
                        otpData = await otpHandler.storeOTP(userId, 10);
                      }

                      // if (isCreatedByAdmin) {
                      //   try {

                      //     // Get business name
                      //     const businessName = req.body.business_name ||
                      //                        req.body.business_name_english ||
                      //                        req.body.business_name_ar ||
                      //                        "Your Business";

                      //     console.log("📧 [Business Registration] Using business name:", businessName);

                      //     // Force correct email type regardless of what's in the request
                      //     const emailType = "newbusinessuserprofile";
                      //     const emailLanguage = req.body.language === "ar" ? "ar" : "en";
                      //                         const welcomeEmailReq = {
                      //       body: {
                      //         email: req.body.user_email,
                      //         user_name: req.body.user_public_name,
                      //         business_name: businessName,
                      //         username: req.body.user_email,
                      //         password: req.body.user_password,
                      //         type: emailType,
                      //         language: emailLanguage,
                      //         loginUrl: "https://nabnee.com/login"
                      //       },
                      //     };

                      //       // Send welcome email for admin-created accounts
                      //     try {
                      //       const emailResult = await notifCtrl.send_mail(welcomeEmailReq);

                      //     } catch (emailError) {
                      //       console.error("❌ [Admin Registration] Error sending welcome email:", emailError);
                      //     }
                      //   } catch (emailError) {
                      //     console.error("❌ [Business Registration] Error sending welcome email:", emailError);
                      //     // Don't throw - continue with user creation even if email fails
                      //   }
                      // } else {
                      //   console.log("📧 [Business Registration] Skipping welcome email (flag not set)");
                      // }                      // Only send OTP verification if this is NOT an admin-created account
                      // Admin-created accounts (with send_email flag) don't need OTP verification
                      if (!isCreatedByAdmin && otpData) {
                        // This is a self-registration, send OTP verification email
                        const otpEmailReq = {
                          body: {
                            email: req.body.user_email,
                            user_name: req.body.user_public_name,
                            subject_body: "Your nabnee Verification Code",
                            type:
                              req.body.user_language === "ar"
                                ? "otp_verification_ar"
                                : "otp_verification",
                            otp_code: otpData.otpCode,
                            language:
                              req.body.user_language === "ar" ? "ar" : "en",
                          },
                        };
                        // Send OTP email
                        await notifCtrl.send_mail(otpEmailReq);
                        console.log(
                          "📧 [Self Registration] OTP verification email sent"
                        );
                      } else {
                        console.log(
                          "📧 [Admin Registration] Skipping OTP verification email for admin-created account"
                        );
                      } // Add OTP expiry to response and hide sensitive data (only if OTP was created)
                      if (otpData) {
                        userContent.otp_expiry = otpData.expiryDate;
                      }
                      userContent.otp_code = undefined;
                      userContent.user_password = undefined;
                    }

                    resolve(userResponse);
                  } catch (error) {
                    resolve(userResponse); // Still return the user response even if OTP process fails
                  }
                })
                .catch((error) => {
                  resolve(resObj.register_resp("Error", error.message));
                });
            } else if (req.body.user_email && req.body.user_gid) {
              try {
                const result = await dbhandler.create_business_user_gmail(
                  req.body.user_type,
                  req.body.user_public_name,
                  req.body.user_email,
                  req.body.user_fcm,
                  req.body.user_gid,
                  req.body.user_dp
                );

                resolve(result);
              } catch (error) {
                console.error(
                  "❌ [Google Registration Debug] Error in Gmail user creation:",
                  error
                );
                resolve(resObj.register_resp("Error", error.message));
              }
            } else {
              resolve(resObj.user_operation_responses("Not found", resp));
            }
          } else if (resp.length > 0) {
            // Check if user exists but is still pending verification
            if (
              req.body.user_email &&
              req.body.user_password &&
              req.body.user_public_name
            ) {
              if (resp[0].user_status === "pending") {
                try {
                  const otpHandler = require("../utils/otp-handler.js");
                  const userId = resp[0]._id;

                  const otpData = await otpHandler.storeOTP(userId, 10);

                  const testOtpHelper = require("../utils/test-otp-helper");
                  testOtpHelper.storeTestOtp(userId, otpData.otpCode);

                  const emailReq = {
                    body: {
                      email: req.body.user_email,
                      user_name: resp[0].user_public_name,
                      subject_body: "Your nabnee Verification Code",
                      type:
                        req.body.user_language === "ar"
                          ? "otp_verification_ar"
                          : "otp_verification",
                      otp_code: otpData.otpCode,
                    },
                  };

                  const notifCtrl = require("./notification_controller.js");
                  await notifCtrl.send_mail(emailReq);

                  const response = {
                    ...resp[0],
                    otp_expiry: otpData.expiryDate,
                    user_password: undefined,
                    otp_code: undefined,
                  };

                  resolve(resObj.register_resp("OTPResent", response));
                  return;
                } catch (error) {
                  resolve(
                    resObj.register_resp(
                      "AccountExist",
                      "User exists but OTP could not be sent"
                    )
                  );
                  return;
                }
              } else {
                resolve(resObj.register_resp("AccountExist", "NA"));
                return;
              }
            }

            // Handle regular login attempts
            if (
              req.body.user_email &&
              req.body.user_password &&
              !req.body.user_public_name
            ) {
              if (resp[0].user_password) {
                bcrypt
                  .compare(req.body.user_password, resp[0].user_password)
                  .then((passwordMatch) => {
                    if (passwordMatch) {
                      if (resp[0].user_status === "pending") {
                        resolve(
                          resObj.register_resp(
                            "AccountPending",
                            "Please verify your email before logging in"
                          )
                        );
                      } else {
                        resp[0].user_password = undefined;
                        resolve(resObj.register_resp("LoggedIn", resp[0]));
                      }
                    } else {
                      resolve(resObj.register_resp("PasswordMismatch", "NA"));
                    }
                  })
                  .catch((error) => {
                    resolve(resObj.register_resp("Error", error.message));
                  });
              } else {
                resolve(resObj.register_resp("ModeMismatch", "NA"));
              }
            } else if (req.body.user_email && req.body.user_gid) {
              try {
                const updateResult = await BusinessUser.findOneAndUpdate(
                  { user_email: req.body.user_email },
                  { $set: { user_status: "approved" } },
                  { new: true }
                );

                const loginResult =
                  await dbhandler.update_business_user_for_login_gmail(
                    req.body.user_type,
                    req.body.user_public_name,
                    req.body.user_public_name,
                    req.body.user_email,
                    req.body.user_fcm,
                    req.body.user_gid,
                    req.body.user_dp
                  );

                resolve(loginResult);
              } catch (error) {
                console.error(
                  "❌ [Google Registration Debug] Error in Gmail login update:",
                  error
                );
                resolve(resObj.register_resp("Error", error.message));
              }
            }
          } else {
            resolve(resObj.content_operation_responses("Error", resp));
          }
        })
        .catch((error) => {
          resolve(resObj.register_resp("Error", error.message));
        });
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.refresh_login_with_token = function (req, res) {
  return new Promise(async function (resolve, reject) {
    if (req.userId) {
      const result = await authHandler.getUserById(req.userId);

      if (result.success) {
        resolve(resObj.user_operation_responses("Fetch", result.user));
      } else {
        resolve(resObj.user_operation_responses("Not found", result.message));
      }
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.read_business_reviews = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_id) {
      resolve(dbhandler.read_business_reviews(req.body.user_id));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.create_bulk_users = function (req, res) {
  return new Promise((resolve, reject) => {
    const { usersData } = req.body;
    if (!usersData) {
      resolve(
        resObj.content_operation_responses("Error", "No users data found")
      );
    } else {
      resolve(dbhandler.create_bulk_users(usersData));
    }
  });
};
module.exports.follow_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.thisUserId && req.body.targetUserId) {
      resolve(dbhandler.follow_user(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.unfollow_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.thisUserId && req.body.targetUserId) {
      resolve(dbhandler.unfollow_user(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.user_followers = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_id) {
      resolve(dbhandler.user_followers(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.user_following = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_id) {
      resolve(dbhandler.user_following(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.read_business_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    // if (req.body.offset) {
    resolve(dbhandler.read_business_user(req, res));
    // } else {
    //   resolve(resObj.user_operation_responses("Insufficient details", req));
    // }
  });
};
module.exports.search_business_user_name = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_name) {
      resolve(dbhandler.search_business_by_user_name(req.body.user_name));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.verify_account = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_oid) {
      resolve(dbhandler.verify_business_by_oid(req.body.user_oid));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.read_business_reviews = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_id) {
      resolve(dbhandler.read_business_reviews(req.body.user_id));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.get_suggested_businesses = function (req, res) {
  return new Promise((resolve, reject) => {
    if (req.body.user_id) {
      resolve(dbhandler.get_suggested_businesses(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.is_account_verified = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_email) {
      dbhandler.find_business_user(req.body.user_email).then((resp) => {
        if (resp.length == 0) {
          resolve(resObj.user_operation_responses("Not found"));
        } else {
          const accountVerified = resp[0].user_status === "approved";
          resolve(resObj.user_operation_responses("Verify", accountVerified));
        }
      });
    }
  });
};
module.exports.read_user_details = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_id) {
      resolve(dbhandler.read_user_details(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.read_business_user_by_id = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_id) {
      resolve(dbhandler.read_business_user_by_id(req.body.user_id));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.read_business_user_by_name = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_public_name) {
      // Find any user with this public name (without filtering by user_type)
      BusinessUser.find({
        user_public_name: req.body.user_public_name,
      })
        .then((users) => {
          if (users && users.length > 0) {
            resolve(resObj.user_operation_responses("Fetch", users));
          } else {
            // Try case-insensitive search as fallback
            return BusinessUser.find({
              user_public_name: {
                $regex: new RegExp("^" + req.body.user_public_name + "$", "i"),
              },
            });
          }
        })
        .then((users) => {
          if (!users || users.length === 0) {
            resolve(
              resObj.user_operation_responses(
                "Not found",
                "User with this name not found"
              )
            );
          } else if (users && users.length > 0) {
            resolve(resObj.user_operation_responses("Fetch", users));
          }
        })
        .catch((error) => {
          resolve(resObj.user_operation_responses("Error", error.message));
        });
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.read_business_user_by_oid = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_oid) {
      resolve(dbhandler.read_business_user_by_id(req.body.user_oid));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.read_business_user_by_timeline = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.start && req.body.end) {
      resolve(
        dbhandler.read_business_user_by_timeline(req.body.start, req.body.end)
      );
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.read_user_by_timeline = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.start && req.body.end) {
      resolve(dbhandler.read_user_by_timeline(req.body.start, req.body.end));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.update_business_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_email) {
      resolve(dbhandler.update_business_user(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.update_business_user_byId = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body._id) {
      resolve(dbhandler.update_business_user_byId(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.delete_business_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_email) {
      resolve(dbhandler.delete_business_user(req.body.user_email));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.read_business_user_public = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.offset && req.body.filter_type) {
      switch (req.body.filter_type) {
        case "general":
          resolve(dbhandler.read_business_user(req, res));
        case "distance":
          resolve(
            dbhandler.read_business_user_by_distance(
              req.body.lat,
              req.body.long,
              req.body.distance,
              req.body.offset
            )
          );
          break;
        case "category":
          resolve(
            dbhandler.read_business_user_by_category(
              req.body.business_category,
              req.body.offset
            )
          );
          break;
        case "subcategory":
          resolve(
            dbhandler.read_business_user_by_subcategory(
              req.body.business_subcategory,
              req.body.offset
            )
          );
          break;
        case "type":
          resolve(
            dbhandler.read_business_user_by_type(
              req.body.business_type,
              req.body.offset
            )
          );
          break;
        case "space":
          resolve(
            dbhandler.read_business_user_by_space(
              req.body.business_space,
              req.body.offset
            )
          );
          break;
        case "city":
          resolve(
            dbhandler.read_business_user_by_city(req.body.city, req.body.offset)
          );
          break;
        case "brand":
          resolve(
            dbhandler.read_business_user_by_brand(
              req.body.business_brand,
              req.body.offset
            )
          );
          break;
      }
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.read_business_user_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.offset && req.body.details) {
      resolve(dbhandler.read_business_user_all(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};
module.exports.read_businessuser_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.details) {
      resolve(dbhandler.read_businessuser_all(req, res));
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

module.exports.get_business_categories_andSubcategories = function (req, res) {
  return new Promise(function (resolve, reject) {
    resolve(dbhandler.get_business_categories_andSubcategories(req, res));
  });
};

module.exports.update_business_public = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_review) {
      if (req.body.business_id && req.body.user_review) {
        resolve(dbhandler.update_business_public(req, res));
      } else {
        resolve(resObj.content_operation_responses("Insufficient", req));
      }
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

module.exports.deletecomment = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_review) {
      if (req.body.business_id && req.body.user_review) {
        resolve(dbhandler.deletecomment(req, res));
      } else {
        resolve(resObj.content_operation_responses("Insufficient", req));
      }
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

module.exports.forgotpassword = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_email) {
      console.log("forgotpassword");
      resolve(dbhandler.forgotpassword(req, res));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

module.exports.changepassword = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.id) {
      resolve(dbhandler.changepassword(req, res));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

module.exports.reset_password = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      if (!req.body.reset_token || !req.body.new_password) {
        resolve({
          success: false,
          message: "Reset token and new password are required",
        });
        return;
      }

      // Validate the reset token
      const passwordResetHandler = require("../utils/password-reset-handler.js");
      const tokenValidation = await passwordResetHandler.validateResetToken(
        req.body.reset_token
      );

      if (!tokenValidation.valid) {
        resolve({
          success: false,
          message: tokenValidation.message,
        });
        return;
      }

      // Validate the new password
      const passwordValidation = validatePassword(req.body.new_password);
      if (!passwordValidation.isValid) {
        resolve({
          success: false,
          message: passwordValidation.reason,
        });
        return;
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        req.body.new_password,
        saltRounds
      );

      // Update the user's password
      await BusinessUser.updateOne(
        { _id: tokenValidation.user._id },
        { user_password: hashedPassword }
      );

      // Clear the reset token
      await passwordResetHandler.clearResetToken(
        tokenValidation.user.user_email
      );

      resolve({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Error in reset_password:", error);
      resolve({
        success: false,
        message: "An error occurred while resetting password",
      });
    }
  });
};

module.exports.get_following_feed = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.user_id) {
      // First approach: Check who the user is following
      BusinessUser.findOne({ user_id: req.body.user_id })
        .then((userData) => {
          if (!userData) {
            resolve(resObj.user_operation_responses("Error", "User not found"));
            return;
          }

          let followingIds = userData.user_following || [];

          // Second approach: Find businesses that have this user as a follower
          if (followingIds.length === 0) {
            return BusinessUser.find({ user_followers: req.body.user_id })
              .select("user_id")
              .then((businesses) => {
                followingIds = businesses.map((b) => b.user_id);

                if (followingIds.length === 0) {
                  resolve(resObj.user_operation_responses("Fetch", []));
                  return null;
                }

                return followingIds;
              });
          }

          return followingIds;
        })
        .then((followingIds) => {
          if (!followingIds) return;

          // Use dbhandler to get feed content
          dbhandler
            .read_following_feed(followingIds)
            .then((feedItems) => {
              resolve(resObj.user_operation_responses("Fetch", feedItems));
            })
            .catch((error) => {
              resolve(resObj.user_operation_responses("Error", error.message));
            });
        })
        .catch((error) => {
          resolve(resObj.user_operation_responses("Error", error.message));
        });
    } else {
      resolve(resObj.user_operation_responses("Insufficient details", req));
    }
  });
};

// Helper functions for custom URL handling
function sanitizeCustomUrl(input) {
  if (!input) return null;
  // Convert to lowercase and replace spaces with hyphens
  let url = input.toLowerCase().trim().replace(/\s+/g, "-");
  // Remove any non-alphanumeric characters except hyphens
  url = url.replace(/[^a-z0-9-]/g, "");
  // Remove multiple consecutive hyphens
  url = url.replace(/-+/g, "-");
  // Remove leading and trailing hyphens
  url = url.replace(/^-+|-+$/g, "");
  return url;
}

function validateCustomUrl(url) {
  if (!url) {
    return { isValid: false, reason: "URL cannot be empty" };
  }

  if (url.length < 3) {
    return { isValid: false, reason: "URL must be at least 3 characters long" };
  }

  if (url.length > 50) {
    return { isValid: false, reason: "URL cannot exceed 50 characters" };
  }

  // Check that URL only contains alphanumeric characters and hyphens
  if (!/^[a-z0-9-]+$/.test(url)) {
    return {
      isValid: false,
      reason: "URL can only contain lowercase letters, numbers, and hyphens",
    };
  }

  // URL cannot start or end with a hyphen
  if (url.startsWith("-") || url.endsWith("-")) {
    return { isValid: false, reason: "URL cannot start or end with a hyphen" };
  }

  return { isValid: true };
}

// OTP verification function
module.exports.verify_otp = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      if (!req.body.user_email || !req.body.otp) {
        resolve({
          success: false,
          message: "Email and OTP are required",
        });
        return;
      }

      const otpHandler = require("../utils/otp-handler.js");
      const result = await otpHandler.verifyOTP(
        req.body.user_email,
        req.body.otp
      );

      if (result) {
        // If verification was successful, return user details
        const user = await BusinessUser.findOne(
          mongoose.Types.ObjectId.isValid(req.body.user_email)
            ? { _id: req.body.user_email }
            : { user_email: req.body.user_email }
        );

        resolve({
          success: true,
          message: "OTP verified successfully",
          user_details: [user],
        });
      } else {
        resolve({
          success: false,
          message: "Invalid or expired OTP",
        });
      }
    } catch (error) {
      console.error("Error in verify_otp:", error);
      resolve({
        success: false,
        message: "An error occurred while verifying OTP",
        error: error.message,
      });
    }
  });
};

// Send OTP verification function
module.exports.send_otp_verification = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      if (!req.body.user_email) {
        resolve({
          success: false,
          message: "Email is required",
        });
        return;
      }

      // Find user by email
      const user = await BusinessUser.findOne({
        user_email: req.body.user_email,
      });

      if (!user) {
        resolve({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Import the OTP handler
      const otpHandler = require("../utils/otp-handler.js");

      // Generate and store OTP for the user
      const otpData = await otpHandler.storeOTP(user._id, 10); // 10 minutes expiry

      // Import notification controller
      const notifCtrl = require("./notification_controller.js");

      // Prepare email data
      const emailReq = {
        body: {
          email: user.user_email,
          user_name: user.user_public_name,
          subject_body: "Your nabnee Verification Code",
          type:
            user.user_language === "ar"
              ? "otp_verification_ar"
              : "otp_verification",
          otp_code: otpData.otpCode,
        },
      };

      // Send OTP email
      await notifCtrl.send_mail(emailReq);

      // Hide sensitive info in response
      user.otp_code = undefined;
      user.otp_expiry = otpData.expiryDate;

      resolve({
        success: true,
        message: "OTP sent successfully",
        user_details: user,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      resolve({
        success: false,
        message: "An error occurred while sending OTP",
        error: error.message,
      });
    }
  });
};

// Login function for business users
module.exports.login_business_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    try {
      // Check if required fields are present
      if (
        !req.body.user_email ||
        (!req.body.user_password && !req.body.user_gid)
      ) {
        resolve({
          success: false,
          message: "Email and password or Google ID are required",
          error: "MISSING_CREDENTIALS",
        });
        return;
      }

      // Handle standard email/password login
      if (req.body.user_password) {
        dbhandler
          .find_business_user(req.body.user_email)
          .then((users) => {
            if (users.length === 0) {
              resolve({
                success: false,
                message: "User with this email doesn't exist",
                error: "USER_NOT_FOUND",
              });
              return;
            }

            const user = users[0];

            // Check if user has a password (might be a Google/Facebook user)
            if (!user.user_password) {
              resolve({
                success: false,
                message:
                  "This account doesn't use password login. Try logging in with Google instead.",
                error: "SOCIAL_LOGIN_REQUIRED",
              });
              return;
            }

            // Verify password
            bcrypt
              .compare(req.body.user_password, user.user_password)
              .then((passwordMatch) => {
                if (!passwordMatch) {
                  resolve({
                    success: false,
                    message: "Invalid password",
                    error: "INVALID_PASSWORD",
                  });
                  return;
                }

                // Check account verification status
                if (user.user_status === "pending") {
                  resolve({
                    success: false,
                    message: "Please verify your email before logging in",
                    error: "EMAIL_NOT_VERIFIED",
                  });
                  return;
                }

                // Create token and prepare response
                const jwt = require("jsonwebtoken");
                const ConstantCtrl = require("../utils/constants.js");

                const token = jwt.sign(
                  { user_email: user.user_email, userId: user._id },
                  ConstantCtrl.JWT_SECRET,
                  { expiresIn: "15d" }
                );

                // Remove password from response
                user.user_password = undefined;

                // Return success response with user data and token
                resolve({
                  success: true,
                  message: "Logged in successfully",
                  user_details: [user],
                  user_token: token,
                });
              })
              .catch((error) => {
                console.error("Login error:", error);
                resolve({
                  success: false,
                  message: "An error occurred during login verification",
                  error: "INTERNAL_ERROR",
                });
              });
          })
          .catch((error) => {
            console.error("Login error:", error);
            resolve({
              success: false,
              message: "An error occurred while finding user",
              error: "INTERNAL_ERROR",
            });
          });
      }
      // Handle Google login
      else if (req.body.user_gid) {
        dbhandler
          .find_business_user(req.body.user_email)
          .then((users) => {
            if (users.length === 0) {
              // User doesn't exist, suggest registration
              resolve({
                success: false,
                message:
                  "This Google account is not registered. Please register first.",
                error: "USER_NOT_FOUND",
              });
              return;
            }

            const user = users[0];

            // Update user record with Google ID if not already set
            dbhandler
              .update_business_user_for_login_gmail(
                user.user_type,
                user.user_public_name,
                user.user_public_name,
                req.body.user_email,
                req.body.user_fcm || user.user_fcm,
                req.body.user_gid,
                req.body.user_dp || user.user_dp
              )
              .then((updatedUser) => {
                if (!updatedUser || !updatedUser.success) {
                  resolve({
                    success: false,
                    message: "Failed to update user with Google ID",
                    error: "UPDATE_FAILED",
                  });
                  return;
                }

                // Return success response with user data
                resolve({
                  success: true,
                  message: "Logged in with Google successfully",
                  user_details: updatedUser.user_details,
                  user_token: updatedUser.user_token,
                });
              })
              .catch((error) => {
                console.error("Google login error:", error);
                resolve({
                  success: false,
                  message: error.message || "Google login failed",
                  error: "GOOGLE_LOGIN_ERROR",
                });
              });
          })
          .catch((error) => {
            console.error("Google login error:", error);
            resolve({
              success: false,
              message: error.message || "Google login failed",
              error: "GOOGLE_LOGIN_ERROR",
            });
          });
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      resolve({
        success: false,
        message: "An unexpected error occurred",
        error: "INTERNAL_ERROR",
      });
    }
  });
};

// Branch Management Operations
module.exports.add_branch = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      if (!req.body.business_id) {
        return res
          .status(400)
          .json({ success: false, message: "Business ID is required" });
      }

      if (!req.body.branch || !req.body.branch.name) {
        return res
          .status(400)
          .json({ success: false, message: "Branch name is required" });
      }

      // Find the business user
      const businessUser = await BusinessUser.findById(req.body.business_id);
      if (!businessUser) {
        return res
          .status(404)
          .json({ success: false, message: "Business user not found" });
      }

      if (!businessUser.branches) {
        businessUser.branches = [];
      }

      const newBranch = {
        name: req.body.branch.name,
        name_ar: req.body.branch.name_ar,
        branch_name: req.body.branch.branch_name,
        branch_name_ar: req.body.branch.branch_name_ar,
        phone: req.body.branch.phone,
        address: req.body.branch.address,
        address_ar: req.body.branch.address_ar,
        location_lat: req.body.branch.location_lat,
        location_long: req.body.branch.location_long,
        business_hours: req.body.branch.business_hours || [],
        leisure_hours: req.body.branch.leisure_hours || [],
        city: req.body.branch.city,
        city_ar: req.body.branch.city_ar,
        is_main: req.body.branch.is_main || false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      console.log("Adding new branch:", newBranch);

      if (businessUser.branches.length === 0 || newBranch.is_main) {
        // If this is a new main branch, unmark any existing main branch
        if (newBranch.is_main && businessUser.branches.length > 0) {
          businessUser.branches.forEach((b) => {
            b.is_main = false;
          });
        }
        newBranch.is_main = true;
      }

      // Add the new branch to the business
      businessUser.branches.push(newBranch);

      // If this is the main branch, also update the main business info for backward compatibility
      if (newBranch.is_main) {
        businessUser.location_lat = newBranch.location_lat;
        businessUser.location_long = newBranch.location_long;
        businessUser.address = newBranch.address;
        businessUser.address_ar = newBranch.address_ar;
        businessUser.business_hours = newBranch.business_hours;
        businessUser.leisure_hours = newBranch.leisure_hours;
        businessUser.business_city = newBranch.city;
        businessUser.business_city_ar = newBranch.city_ar;
        businessUser.branch_name = newBranch.branch_name;
      }

      // Save the updated business user
      await businessUser.save();

      console.log("Branch added successfully:", newBranch);
      return res.status(201).json({
        success: true,
        message: "Branch created successfully",
        details: {
          business: businessUser,
          branch: businessUser.branches[businessUser.branches.length - 1],
        },
      });
    } catch (error) {
      console.error("Error adding branch:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create branch: " + error.message,
      });
    }
  });
};

module.exports.get_branches = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      // Validate request
      if (!req.body.business_id) {
        return res
          .status(400)
          .json({ success: false, message: "Business ID is required" });
      }

      // Find the business user
      const businessUser = await BusinessUser.findById(req.body.business_id);
      if (!businessUser) {
        return res
          .status(404)
          .json({ success: false, message: "Business user not found" });
      }

      // Return branches
      return res.status(200).json({
        success: true,
        message: "Branches retrieved successfully",
        details: {
          branches: businessUser.branches || [],
        },
      });
    } catch (error) {
      console.error("Error getting branches:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve branches: " + error.message,
      });
    }
  });
};

module.exports.update_branch = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      // Validate request
      if (!req.body.business_id) {
        return res
          .status(400)
          .json({ success: false, message: "Business ID is required" });
      }

      if (!req.body.branch_id) {
        return res
          .status(400)
          .json({ success: false, message: "Branch ID is required" });
      }

      // Find the business user
      const businessUser = await BusinessUser.findById(req.body.business_id);
      if (!businessUser) {
        return res
          .status(404)
          .json({ success: false, message: "Business user not found" });
      }

      // Find the branch to update
      if (!businessUser.branches || businessUser.branches.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No branches found for this business",
        });
      }

      // Find the branch index
      const branchIndex = businessUser.branches.findIndex(
        (branch) => branch._id.toString() === req.body.branch_id
      );

      if (branchIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Branch not found" });
      }

      // Update branch fields
      const updateData = req.body.branch || {};
      if (updateData.name)
        businessUser.branches[branchIndex].name = updateData.name;
      if (updateData.name_ar)
        businessUser.branches[branchIndex].name_ar = updateData.name_ar;
      if (updateData.branch_name)
        businessUser.branches[branchIndex].branch_name = updateData.branch_name;
      if (updateData.branch_name_ar)
        businessUser.branches[branchIndex].branch_name_ar =
          updateData.branch_name_ar;
      if (updateData.phone)
        businessUser.branches[branchIndex].phone = updateData.phone;
      if (updateData.address)
        businessUser.branches[branchIndex].address = updateData.address;
      if (updateData.address_ar)
        businessUser.branches[branchIndex].address_ar = updateData.address_ar;
      if (updateData.location_lat)
        businessUser.branches[branchIndex].location_lat =
          updateData.location_lat;
      if (updateData.location_long)
        businessUser.branches[branchIndex].location_long =
          updateData.location_long;
      if (updateData.business_hours)
        businessUser.branches[branchIndex].business_hours =
          updateData.business_hours;
      if (updateData.leisure_hours)
        businessUser.branches[branchIndex].leisure_hours =
          updateData.leisure_hours;
      if (updateData.city)
        businessUser.branches[branchIndex].city = updateData.city;
      if (updateData.city_ar)
        businessUser.branches[branchIndex].city_ar = updateData.city_ar;

      // Handle is_main flag
      if (updateData.is_main === true) {
        // Set this branch as main and unset all others
        businessUser.branches.forEach((branch, i) => {
          branch.is_main = i === branchIndex;
        });

        // Update the main business info for backward compatibility
        businessUser.location_lat =
          businessUser.branches[branchIndex].location_lat;
        businessUser.location_long =
          businessUser.branches[branchIndex].location_long;
        businessUser.address = businessUser.branches[branchIndex].address;
        businessUser.address_ar = businessUser.branches[branchIndex].address_ar;
        businessUser.business_hours =
          businessUser.branches[branchIndex].business_hours;
        businessUser.leisure_hours =
          businessUser.branches[branchIndex].leisure_hours;
        businessUser.business_city = businessUser.branches[branchIndex].city;
        businessUser.business_city_ar =
          businessUser.branches[branchIndex].city_ar;
        businessUser.branch_name =
          businessUser.branches[branchIndex].branch_name;
        businessUser.branch_name_ar =
          businessUser.branches[branchIndex].branch_name_ar;
      }
      businessUser.branches[branchIndex].updated_at = new Date();

      // Save changes
      await businessUser.save();

      return res.status(200).json({
        success: true,
        message: "Branch updated successfully",
        details: {
          branch: businessUser.branches[branchIndex],
        },
      });
    } catch (error) {
      console.error("Error updating branch:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update branch: " + error.message,
      });
    }
  });
};

module.exports.delete_branch = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      console.log("Delete branch request:", req.body);

      // Validate request
      if (!req.body.business_id) {
        console.log("Missing business_id");
        return res.status(400).json({
          success: false,
          message: "Business ID is required",
        });
      }

      if (!req.body.branch_id) {
        console.log("Missing branch_id");
        return res.status(400).json({
          success: false,
          message: "Branch ID is required",
        });
      }

      // Find the business user
      console.log("Finding business with ID:", req.body.business_id);
      const businessUser = await BusinessUser.findById(req.body.business_id);
      if (!businessUser) {
        console.log("Business not found");
        return res.status(404).json({
          success: false,
          message: "Business user not found",
        });
      }

      // Find the branch to delete
      if (!businessUser.branches || businessUser.branches.length === 0) {
        console.log("No branches found for this business");
        return res.status(404).json({
          success: false,
          message: "No branches found for this business",
        });
      }

      const branchIndex = businessUser.branches.findIndex(
        (branch) => branch._id.toString() === req.body.branch_id
      );

      if (branchIndex === -1) {
        console.log("Branch not found");
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      // Check if trying to delete the main branch when it's the only one
      if (
        businessUser.branches[branchIndex].is_main &&
        businessUser.branches.length === 1
      ) {
        console.log("Cannot delete the only branch");
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete the only branch of a business. A business must have at least one branch.",
        });
      }

      // If deleting the main branch, set another branch as main
      if (businessUser.branches[branchIndex].is_main) {
        console.log("Deleting main branch, setting another branch as main");

        // Find another branch to make main
        const newMainIndex = branchIndex === 0 ? 1 : 0;
        businessUser.branches[newMainIndex].is_main = true;

        // Update main business info for backward compatibility
        businessUser.location_lat =
          businessUser.branches[newMainIndex].location_lat;
        businessUser.location_long =
          businessUser.branches[newMainIndex].location_long;
        businessUser.address = businessUser.branches[newMainIndex].address;
        businessUser.address_ar =
          businessUser.branches[newMainIndex].address_ar;
        businessUser.business_hours =
          businessUser.branches[newMainIndex].business_hours;
        businessUser.leisure_hours =
          businessUser.branches[newMainIndex].leisure_hours;
        businessUser.business_city = businessUser.branches[newMainIndex].city;
        businessUser.business_city_ar =
          businessUser.branches[newMainIndex].city_ar;
        businessUser.branch_name =
          businessUser.branches[newMainIndex].branch_name;
      }

      businessUser.branches.splice(branchIndex, 1);

      await businessUser.save();

      return res.status(200).json({
        success: true,
        message: "Branch deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting branch:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete branch: " + error.message,
      });
    }
  });
};

// Get single branch by ID for editing
module.exports.get_branch_by_id = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      console.log("=== GET BRANCH BY ID ===");
      console.log("Request body:", req.body);

      if (!req.body.business_id || !req.body.branch_id) {
        console.log("Missing required parameters");
        return res.status(400).json({
          success: false,
          message: "business_id and branch_id are required",
        });
      }

      console.log("Looking for business:", req.body.business_id);
      console.log("Looking for branch:", req.body.branch_id);

      // Find the business user
      const businessUser = await BusinessUser.findById(req.body.business_id);

      if (!businessUser) {
        console.log("Business user not found");
        return res.status(404).json({
          success: false,
          message: "Business not found",
        });
      }

      console.log("Found business user:", businessUser.user_public_name);
      console.log("Available branches:", businessUser.branches.length);
      console.log(
        "Branch IDs:",
        businessUser.branches.map((b) => b._id.toString())
      );

      // Find the specific branch
      const branch = businessUser.branches.find(
        (branch) => branch._id.toString() === req.body.branch_id
      );

      if (!branch) {
        console.log("Branch not found");
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      console.log("Found branch:", branch.name);

      // Return the branch data
      return res.status(200).json({
        success: true,
        message: "Branch retrieved successfully",
        details: branch,
      });
    } catch (error) {
      console.error("Error getting branch by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get branch: " + error.message,
      });
    }
  });
};

module.exports.send_business_claim_email = async function (req, res) {
  try {
    const { user_email, business_name } = req.body;
    const user = await BusinessUser.findOne({ user_email });
    console.log("User found:", user);
    if (!user) return res.json({ success: false, message: "User not found" });

    // Generate token
    const claimToken = crypto.randomBytes(32).toString("hex");
    user.claim_token = claimToken;
    user.claim_token_expiry = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();
    console.log("Saved user:", user.claim_token, user.claim_token_expiry);
    // Send email
    await notifCtrl.send_mail({
      body: {
        email: user.user_email,
        user_name: user.user_public_name,
        business_name: business_name || user.business_name_english,
        type: "business_claim",
        claim_token: claimToken,
        language: user.user_language || "en",
      },
    });

    res.json({ success: true, message: "Claim email sent" });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

module.exports.verify_claim_token = async function (req, res) {
  try {
    const { token } = req.body;
    const user = await BusinessUser.findOne({
      claim_token: token,
      claim_token_expiry: { $gt: Date.now() },
    });
    if (!user)
      return res.json({ success: false, message: "Invalid or expired token" });

    // DO NOT clear the token or update the user here!
    res.json({
      success: true,
      message: "Token valid",
      user: {
        user_email: user.user_email,
        user_public_name: user.user_public_name,
      },
    });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

module.exports.claim_set_password = async function (req, res) {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Find user by claim token and check expiry
    const user = await BusinessUser.findOne({
      claim_token: token,
      claim_token_expiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired claim token",
      });
    }

    // Validate password (reuse your existing validation)
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.isValid) {
      return res.json({ success: false, message: passwordValidation.reason });
    }

    // Hash and set the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);
    user.user_password = hashedPassword;

    // Invalidate the claim token
    user.claim_token = null;
    user.claim_token_expiry = null;
    user.user_status = "approved";
    await user.save();

    res.json({
      success: true,
      message: "Password set successfully. You can now log in.",
    });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};
