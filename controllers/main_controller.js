/**
 * Created by User Tnine on July 16 2019.
 **/

let Promise = require("bluebird");
let businesscatCtrl = require("./business_category_controller");
let inventorycatCtrl = require("./inventory_category_controller");
let inventorysubcatCtrl = require("./inventory_subcategory_controller");
let businesssubcatCtrl = require("./business_subcategory_controller");
let businessUserCtrl = require("./business_user_controller");
let inventoryCtrl = require("./inventory_controller");
let filterCtrl = require("./filter_controller");
let ColCtrl = require("./collection_controller");
let projectCtrl = require("./project_controller");
let blogCtrl = require("./blog_controller");
let countryCtrl = require("./country_controller");
let materiallistCtrl = require("./materiallist_controller");
let projectplanCtrl = require("./projectplan_controller");
let contractCtrl = require("./contract_controller");
let quoteCtrl = require("./quote_controller");
let quotesubmissionCtrl = require("./quotesubmission_controller");
let adminCtrl = require("./admin_controller");
let notifCtrl = require("./notification_controller");
let handlerCtrl = require("../utils/dbhandler.js");
let resObj = require("../utils/response.js");

let Inventory = require("../models/model_inventory");
let BusinessUser = require("../models/model_business_user");
let hashtagCtrl = require("./hashtag_controller");

//---------------Content handlers--------------------------------------------------------------------

//************************************** Business Category *****************************************************
this.create_business_category = function (req, res) {
  businesscatCtrl.create_business_category(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_category = function (req, res) {
  businesscatCtrl.read_business_category(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_category_admin = function (req, res) {
  businesscatCtrl.read_business_category_admin(req, res).then((response) => {
    res.send(response);
  });
};

this.update_business_category = function (req, res) {
  businesscatCtrl.update_business_category(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_business_category = function (req, res) {
  businesscatCtrl.delete_business_category(req, res).then((response) => {
    res.send(response);
  });
};
//************************************** Business Category End *****************************************************

//************************************** Business Sub Category  *****************************************************
this.create_business_subcategory = function (req, res) {
  businesssubcatCtrl.create_business_subcategory(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_subcategory = function (req, res) {
  businesssubcatCtrl.read_business_subcategory(req, res).then((response) => {
    res.send(response);
  });
};
this.read_business_subcategory_admin = function (req, res) {
  businesssubcatCtrl
    .read_business_subcategory_admin(req, res)
    .then((response) => {
      res.send(response);
    });
};
this.update_business_subcategory = function (req, res) {
  businesssubcatCtrl.update_business_subcategory(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_business_subcategory = function (req, res) {
  businesssubcatCtrl.delete_business_subcategory(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** Business Sub Category End *****************************************************
//************************************** Inventory Category *****************************************************
this.create_inventory_category = function (req, res) {
  inventorycatCtrl.create_inventory_category(req, res).then((response) => {
    res.send(response);
  });
};

this.read_inventory_category = function (req, res) {
  inventorycatCtrl.read_inventory_category(req, res).then((response) => {
    res.send(response);
  });
};
this.read_inventory_category_admin = function (req, res) {
  inventorycatCtrl.read_inventory_category_admin(req, res).then((response) => {
    res.send(response);
  });
};
this.update_inventory_category = function (req, res) {
  inventorycatCtrl.update_inventory_category(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_inventory_category = function (req, res) {
  inventorycatCtrl.delete_inventory_category(req, res).then((response) => {
    res.send(response);
  });
};

//************************************** Inventory Sub Category *****************************************************
this.create_inventory_subcategory = function (req, res) {
  inventorysubcatCtrl
    .create_inventory_subcategory(req, res)
    .then((response) => {
      res.send(response);
    });
};

this.read_inventory_subcategory = function (req, res) {
  inventorysubcatCtrl.read_inventory_subcategory(req, res).then((response) => {
    res.send(response);
  });
};
this.read_inventory_subcategory_admin = function (req, res) {
  inventorysubcatCtrl
    .read_inventory_subcategory_admin(req, res)
    .then((response) => {
      res.send(response);
    });
};
this.update_inventory_subcategory = function (req, res) {
  inventorysubcatCtrl
    .update_inventory_subcategory(req, res)
    .then((response) => {
      res.send(response);
    });
};
this.delete_inventory_subcategory = function (req, res) {
  inventorysubcatCtrl
    .delete_inventory_subcategory(req, res)
    .then((response) => {
      res.send(response);
    });
};

//************************************** Business User *****************************************************
this.create_business_user = function (req, res) {
  businessUserCtrl.create_user(req, res).then((response) => {
    res.send(response);
  });
};
this.refresh_login_with_token = function (req, res) {
  businessUserCtrl.refresh_login_with_token(req, res).then((response) => {
    res.send(response);
  });
};

this.create_bulk_users = function (req, res) {
  businessUserCtrl
    .create_bulk_users(req, res)
    .then((response) => res.send(response));
};
this.get_suggested_businesses = function (req, res) {
  businessUserCtrl.get_suggested_businesses(req, res).then((response) => {
    res.send(response);
  });
};
this.get_business_categories_andSubcategories = function (req, res) {
  businessUserCtrl
    .get_business_categories_andSubcategories(req, res)
    .then((response) => {
      res.send(response);
    });
};

this.send_business_claim_email = function (req, res) {
  return new Promise(async function (resolve, reject) {
    try {
      const { business_id, language = "en" } = req.body;

      if (!business_id) {
        res.send(
          resObj.content_operation_responses("Error", "Business ID is required")
        );
        return;
      }

      // Find the business user
      const BusinessUser = require("../models/model_business_user");
      const business = await BusinessUser.findById(business_id);

      if (!business) {
        res.send(
          resObj.content_operation_responses("Error", "Business not found")
        );
        return;
      }

      // Generate claim token
      const businessClaimHandler = require("../utils/business-claim-handler");
      const claimData =
        await businessClaimHandler.generateClaimToken(business_id);

      // Prepare business name (prefer English, fallback to Arabic or email)
      const businessName =
        business.business_name_english ||
        business.business_name_arabic ||
        business.user_public_name ||
        business.user_email;

      // Send business claim email
      const notifCtrl = require("../controllers/notification_controller");
      const emailResult = await notifCtrl.send_mail({
        body: {
          email: business.user_email,
          user_name: business.user_public_name || "Business Owner",
          type: language === "ar" ? "business_claim_ar" : "business_claim",
          business_name: businessName,
          claim_token: claimData.claimToken,
          language: language,
        },
      });

      res.send(
        resObj.content_operation_responses(
          "Success",
          "Business claim email sent successfully"
        )
      );
    } catch (error) {
      console.error("Error sending business claim email:", error);
      res.send(
        resObj.content_operation_responses(
          "Error",
          "Failed to send business claim email"
        )
      );
    }
  });
};

this.resend_account_verification = function (req, res) {
  // Check if user_email is provided
  if (!req.body.user_email) {
    res.send(resObj.user_operation_responses("Error", "Email is required"));
    return;
  }
  // Use the dbhandler to find user by email
  handlerCtrl
    .find_business_user(req.body.user_email)
    .then(async (response) => {
      try {
        // Check if response is an array and has at least one user
        if (!response || !Array.isArray(response) || response.length === 0) {
          return;
        }

        const user = response[0]; // Get the first user from the array

        // Import the OTP handler
        const otpHandler = require("../utils/otp-handler");

        // Generate and store OTP for the user
        const otpData = await otpHandler.storeOTP(user._id, 10); // 10 minutes expiry

        // Prepare email data
        const emailReq = {
          body: {
            email: user.user_email,
            user_name: user.user_public_name || "nabnee User",
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

        // Create response with user details (without sensitive info)
        const responseData = {
          details: [
            {
              ...user,
              otp_code: undefined,
              otp_expiry: otpData.expiryDate,
            },
          ],
        };

        res.send(resObj.content_operation_responses("OTPSent", responseData));
      } catch (error) {
        res.send(resObj.content_operation_responses("Error", error.message));
      }
    })
    .catch((error) => {
      res.send(resObj.user_operation_responses("Error", "User not found"));
    });
};

this.verify_account = function (req, res) {
  businessUserCtrl.verify_account(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_reviews = function (req, res) {
  businessUserCtrl.read_business_reviews(req, res).then((response) => {
    res.send(response);
  });
};

this.is_account_verified = function (req, res) {
  businessUserCtrl.is_account_verified(req, res).then((response) => {
    // For Google/Facebook users, we always want to return verified=true
    if (req.body.user_gid || req.body.user_fid) {
      response.verified = true;
    }
    res.send(response);
  });
};

this.is_account_verified = function (req, res) {
  businessUserCtrl.is_account_verified(req, res).then((response) => {
    res.send(response);
  });
};

this.search_business_user_name = function (req, res) {
  businessUserCtrl.search_business_user_name(req, res).then((response) => {
    res.send(response);
  });
};

this.search_general = async function (req, res) {
  // Search businesses
  const businessSearch = await BusinessUser.find({
    $or: [
      { user_name: { $regex: req.body.keyword.toLowerCase(), $options: "i" } },
      {
        user_public_name: {
          $regex: req.body.keyword.toLowerCase(),
          $options: "i",
        },
      },
      {
        business_description_english: {
          $regex: req.body.keyword.toLowerCase(),
          $options: "i",
        },
      },
      {
        business_description_arabic: {
          $regex: req.body.keyword.toLowerCase(),
          $options: "i",
        },
      },
    ],
    user_status: "approved",
  });

  // Search Designs & Products
  const listingSearch = await Inventory.find({
    $or: [
      { item_name: { $regex: req.body.keyword.toLowerCase(), $options: "i" } },
      {
        item_name_ar: { $regex: req.body.keyword.toLowerCase(), $options: "i" },
      },
      {
        item_description: {
          $regex: req.body.keyword.toLowerCase(),
          $options: "i",
        },
      },
      {
        item_description_ar: {
          $regex: req.body.keyword.toLowerCase(),
          $options: "i",
        },
      },
    ],
    item_status: "approved",
  });

  // Return all results
  res.send({
    businessSearch,
    listingSearch,
  });
};

this.update_business_user = function (req, res) {
  businessUserCtrl.update_business_user(req, res).then((response) => {
    res.send(response);
  });
};

this.update_business_user_byId = function (req, res) {
  businessUserCtrl.update_business_user_byId(req, res).then((response) => {
    res.send(response);
  });
};

this.update_business_public = function (req, res) {
  businessUserCtrl.update_business_public(req, res).then((response) => {
    res.send(response);
  });
};
this.deletecomment = function (req, res) {
  businessUserCtrl.deletecomment(req, res).then((response) => {
    res.send(response);
  });
};

this.delete_business_user = function (req, res) {
  businessUserCtrl.delete_business_user(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_user = function (req, res) {
  businessUserCtrl.read_business_user(req, res).then((response) => {
    res.send(response);
  });
};
this.read_business_reviews = function (req, res) {
  businessUserCtrl.read_business_reviews(req, res).then((response) => {
    res.send(response);
  });
};
this.follow_user = function (req, res) {
  businessUserCtrl.follow_user(req, res).then((response) => {
    res.send(response);
  });
};
this.unfollow_user = function (req, res) {
  businessUserCtrl.unfollow_user(req, res).then((response) => {
    res.send(response);
  });
};
this.user_followers = function (req, res) {
  businessUserCtrl.user_followers(req, res).then((response) => {
    res.send(response);
  });
};
this.user_following = function (req, res) {
  businessUserCtrl.user_following(req, res).then((response) => {
    res.send(response);
  });
};

this.read_user_details = function (req, res) {
  businessUserCtrl.read_user_details(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_user_public = function (req, res) {
  businessUserCtrl.read_business_user_public(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_user_all = function (req, res) {
  businessUserCtrl.read_business_user_all(req, res).then((response) => {
    res.send(response);
  });
};
this.read_businessuser_all = function (req, res) {
  businessUserCtrl.read_businessuser_all(req, res).then((response) => {
    res.send(response);
  });
};
this.read_business_user_by_id = function (req, res) {
  businessUserCtrl.read_business_user_by_id(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_user_by_oid = function (req, res) {
  businessUserCtrl.read_business_user_by_oid(req, res).then((response) => {
    res.send(response);
  });
};

this.read_business_user_by_timeline = function (req, res) {
  businessUserCtrl.read_business_user_by_timeline(req, res).then((response) => {
    res.send(response);
  });
};
this.read_user_by_timeline = function (req, res) {
  businessUserCtrl.read_user_by_timeline(req, res).then((response) => {
    res.send(response);
  });
};

this.forgotpassword = function (req, res) {
  businessUserCtrl.forgotpassword(req, res).then((response) => {
    res.send(response);
  });
};
this.reset_password = function (req, res) {
  businessUserCtrl.reset_password(req, res).then((response) => {
    res.send(response);
  });
};
this.changepassword = function (req, res) {
  businessUserCtrl.changepassword(req, res).then((response) => {
    res.send(response);
  });
};

this.get_following_feed = function (req, res) {
  businessUserCtrl.get_following_feed(req, res).then((response) => {
    res.send(response);
  });
};

//************************************** Business User End  *****************************************************

// //************************************** Collections *****************************************************
this.create_collection = function (req, res) {
  ColCtrl.create_collection(req, res).then((response) => {
    res.send(response);
  });
};
this.read_collection = function (req, res) {
  ColCtrl.read_collection(req, res).then((response) => {
    res.send(response);
  });
};

this.read_collection_by_collection_id = function (req, res) {
  ColCtrl.read_collection_by_collection_id(req, res).then((response) => {
    res.send(response);
  });
};
this.update_collection = function (req, res) {
  ColCtrl.update_collection(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_collection = function (req, res) {
  ColCtrl.delete_collection(req, res).then((response) => {
    res.send(response);
  });
};

//************************************** Business Collection End  *****************************************************

// //************************************** Inventory *****************************************************
this.create_inventory = function (req, res) {
  inventoryCtrl.create_inventory(req, res).then((response) => {
    res.send(response);
  });
};
this.read_inventory_by_user = function (req, res) {
  inventoryCtrl.read_inventory_by_user(req, res).then((response) => {
    res.send(response);
  });
};
this.read_inventory_by_id = function (req, res) {
  inventoryCtrl.read_inventory_by_id(req, res).then((response) => {
    res.send(response);
  });
};
this.read_inventory_all = function (req, res) {
  inventoryCtrl.read_inventory_all(req, res).then((response) => {
    res.send(response);
  });
};
this.update_inventory = function (req, res) {
  inventoryCtrl.update_inventory(req, res).then((response) => {
    res.send(response);
  });
};
this.update_inventory_public = function (req, res) {
  inventoryCtrl.update_inventory_public(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_inventory = function (req, res) {
  inventoryCtrl.delete_inventory(req, res).then((response) => {
    res.send(response);
  });
};
this.search_inventory_related = function (req, res) {
  inventoryCtrl.search_inventory_related(req, res).then((response) => {
    res.send(response);
  });
};

//************************************** Inventory End  *****************************************************

// //************************************** Business Filter *****************************************************
this.create_business_filter = function (req, res) {
  filterCtrl.create_business_filter(req, res).then((response) => {
    res.send(response);
  });
};
this.read_business_filter_all = function (req, res) {
  filterCtrl.read_business_filter_all(req, res).then((response) => {
    res.send(response);
  });
};
this.update_business_filter = function (req, res) {
  filterCtrl.update_business_filter(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_business_filter = function (req, res) {
  filterCtrl.delete_business_filter(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** Inventory Filter *****************************************************
this.create_inventory_filter = function (req, res) {
  filterCtrl.create_inventory_filter(req, res).then((response) => {
    res.send(response);
  });
};
this.read_inventory_filter_all = function (req, res) {
  filterCtrl.read_inventory_filter_all(req, res).then((response) => {
    res.send(response);
  });
};
this.update_inventory_filter = function (req, res) {
  filterCtrl.update_inventory_filter(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_inventory_filter = function (req, res) {
  filterCtrl.delete_inventory_filter(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** Projects *****************************************************
this.create_project = function (req, res) {
  projectCtrl.create_project(req, res).then((response) => {
    res.send(response);
  });
};
this.read_project_by_user = function (req, res) {
  projectCtrl.read_project_by_user(req, res).then((response) => {
    res.send(response);
  });
};
this.read_project_all = function (req, res) {
  projectCtrl.read_project_all(req, res).then((response) => {
    res.send(response);
  });
};
this.read_project_by_id = function (req, res) {
  projectCtrl.read_project_by_id(req, res).then((response) => {
    res.send(response);
  });
};
this.move_listing_to_project = function (req, res) {
  projectCtrl.move_listing_to_project(req, res).then((response) => {
    res.send(response);
  });
};
this.add_listing_to_project = function (req, res) {
  projectCtrl.add_listing_to_project(req, res).then((response) => {
    res.send(response);
  });
};
this.remove_listing_from_project = function (req, res) {
  projectCtrl.remove_listing_from_project(req, res).then((response) => {
    res.send(response);
  });
};
this.update_project = function (req, res) {
  projectCtrl.update_project(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_project = function (req, res) {
  projectCtrl.delete_project(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** Blogs *****************************************************
this.create_blog = function (req, res) {
  blogCtrl.create_blog(req, res).then((response) => {
    res.send(response);
  });
};
this.read_blog_by_user = function (req, res) {
  blogCtrl.read_blog_by_user(req, res).then((response) => {
    res.send(response);
  });
};
this.read_blog_by_id = function (req, res) {
  blogCtrl.read_blog_by_id(req, res).then((response) => {
    res.send(response);
  });
};
this.read_blog_all = function (req, res) {
  blogCtrl.read_blog_all(req, res).then((response) => {
    res.send(response);
  });
};
this.update_blog = function (req, res) {
  blogCtrl.update_blog(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_blog = function (req, res) {
  blogCtrl.delete_blog(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** Notifications *****************************************************
this.send_mail = function (req, res) {
  notifCtrl.send_mail(req, res).then((response) => {
    res.send(response);
  });
};
this.send_notification = function (req, res) {
  notifCtrl.send_notification(req, res).then((response) => {
    res.send(response);
  });
};
// this.read_blog_by_id = function(req, res) {
// 	blogCtrl.read_blog_by_id(req, res).then((response) => { res.send(response) })
// }
// this.read_blog_all = function(req, res) {
// 	blogCtrl.read_blog_all(req, res).then((response) => { res.send(response) })
// }
// this.update_blog = function(req, res) {
// 	blogCtrl.update_blog(req, res).then((response) => { res.send(response) })
// }
// this.delete_blog = function(req, res) {
// 	blogCtrl.delete_blog(req,res).then((response) => { res.send(response) })
// }

// //************************************** Admin *****************************************************
this.admin_create = function (req, res) {
  adminCtrl.admin_create(req, res).then((response) => {
    res.send(response);
  });
};
this.admin_login = function (req, res) {
  adminCtrl.admin_login(req, res).then((response) => {
    res.send(response);
  });
};
this.admin_forgotpassword = function (req, res) {
  adminCtrl.admin_forgotpassword(req, res).then((response) => {
    res.send(response);
  });
};
this.admin_changepassword = function (req, res) {
  adminCtrl.admin_changepassword(req, res).then((response) => {
    res.send(response);
  });
};

this.admin_update = function (req, res) {
  adminCtrl.admin_update(req, res).then((response) => {
    res.send(response);
  });
};
// ************************************* Search *********************************************************
this.search_stats = function (req, res) {
  handlerCtrl
    .search_stats(req.body.start, req.body.end, req.body.search_type)
    .then((response) => {
      res.send(response);
    });
};
// //************************************** Tags *****************************************************
this.create_tag = function (req, res) {
  console.log("Creating tag:", req.body);
  filterCtrl.create_tag(req, res);
};
this.read_tag_all = function (req, res) {
  filterCtrl.read_tag_all(req, res).then((response) => {
    res.send(response);
  });
};

this.get_tags_by_inventory = function (req, res) {
  filterCtrl.get_tags_by_inventory(req, res).then((response) => {
    res.send(response);
  });
};
this.update_tag = function (req, res) {
  filterCtrl.update_tag(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_tag = function (req, res) {
  filterCtrl.delete_tag(req, res).then((response) => {
    res.send(response);
  });
};
this.read_tag_by_id = function (req, res) {
  filterCtrl.read_tag_by_id(req, res).then((response) => {
    res.send(response);
  });
};
this.get_tags_by_inventory = function (req, res) {
  filterCtrl.get_tags_by_inventory(req, res).then((response) => {
    res.send(response);
  });
};

this.remove_tag_from_inventory = function (req, res) {
  filterCtrl.remove_tag_from_inventory(req, res).then((response) => {
    res.send(response);
  });
};

this.get_business_category_by_id = function (req, res) {
  businesscatCtrl.get_business_category_by_id(req, res).then((response) => {
    res.send(response);
  });
};
this.search_tag = function (req, res) {
  filterCtrl.search_tag(req, res).then((response) => {
    res.send(response);
  });
};

this.search_inventory_by_tag = function (req, res) {
  filterCtrl.search_inventory_by_tag(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** country *****************************************************
this.create_country = function (req, res) {
  countryCtrl.create_country(req, res).then((response) => {
    res.send(response);
  });
};
this.read_country = function (req, res) {
  countryCtrl.read_country(req, res).then((response) => {
    res.send(response);
  });
};
this.update_country = function (req, res) {
  countryCtrl.update_country(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_country = function (req, res) {
  countryCtrl.delete_country(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** materiallist *****************************************************
this.create_materiallist = function (req, res) {
  materiallistCtrl.create_materiallist(req, res).then((response) => {
    res.send(response);
  });
};
this.read_materiallist = function (req, res) {
  materiallistCtrl.read_materiallist(req, res).then((response) => {
    res.send(response);
  });
};
this.read_materiallist_new = function (req, res) {
  materiallistCtrl.read_materiallist_new(req, res).then((response) => {
    res.send(response);
  });
};
this.update_materiallist = function (req, res) {
  materiallistCtrl.update_materiallist(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_materiallist = function (req, res) {
  materiallistCtrl.delete_materiallist(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** projectplan *****************************************************
this.create_projectplan = function (req, res) {
  projectplanCtrl.create_projectplan(req, res).then((response) => {
    res.send(response);
  });
};
this.read_projectplan = function (req, res) {
  projectplanCtrl.read_projectplan(req, res).then((response) => {
    res.send(response);
  });
};
this.update_projectplan = function (req, res) {
  projectplanCtrl.update_projectplan(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_projectplan = function (req, res) {
  projectplanCtrl.delete_projectplan(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** contract *****************************************************
this.create_contract = function (req, res) {
  contractCtrl.create_contract(req, res).then((response) => {
    res.send(response);
  });
};
this.read_contract = function (req, res) {
  contractCtrl.read_contract(req, res).then((response) => {
    res.send(response);
  });
};
this.update_contract = function (req, res) {
  contractCtrl.update_contract(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_contract = function (req, res) {
  contractCtrl.delete_contract(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_all_contractbyproject_id = function (req, res) {
  contractCtrl.delete_all_contractbyproject_id(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** quote *****************************************************
this.create_quote = function (req, res) {
  quoteCtrl.create_quote(req, res).then((response) => {
    res.send(response);
  });
};
this.read_quote = function (req, res) {
  quoteCtrl.read_quote(req, res).then((response) => {
    res.send(response);
  });
};
this.update_quote = function (req, res) {
  quoteCtrl.update_quote(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_quote = function (req, res) {
  quoteCtrl.delete_quote(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** quotesubmission *****************************************************
this.create_quotesubmission = function (req, res) {
  quotesubmissionCtrl.create_quotesubmission(req, res).then((response) => {
    res.send(response);
  });
};
this.read_quotesubmission = function (req, res) {
  quotesubmissionCtrl.read_quotesubmission(req, res).then((response) => {
    res.send(response);
  });
};
this.update_quotesubmission = function (req, res) {
  quotesubmissionCtrl.update_quotesubmission(req, res).then((response) => {
    res.send(response);
  });
};
this.delete_quotesubmission = function (req, res) {
  quotesubmissionCtrl.delete_quotesubmission(req, res).then((response) => {
    res.send(response);
  });
};

// //************************************** quote Report *****************************************************
this.numberOfQuotationEequestsCreatedToday = function (req, res) {
  quotesubmissionCtrl
    .numberOfQuotationEequestsCreatedToday(req, res)
    .then((response) => {
      res.send(response);
    });
};
this.numberOfRequestsTillDate = function (req, res) {
  quotesubmissionCtrl.numberOfRequestsTillDate(req, res).then((response) => {
    res.send(response);
  });
};
this.numberOfQuotationsSentToRequestsByBusinessesToday = function (req, res) {
  quotesubmissionCtrl
    .numberOfQuotationsSentToRequestsByBusinessesToday(req, res)
    .then((response) => {
      res.send(response);
    });
};
this.numberOfQuotationsSentToRequestsByBusinessesTillDate = function (
  req,
  res
) {
  quotesubmissionCtrl
    .numberOfQuotationsSentToRequestsByBusinessesTillDate(req, res)
    .then((response) => {
      res.send(response);
    });
};

this.get_following_feed = function (req, res) {
  businessUserCtrl.get_following_feed(req, res).then((response) => {
    res.send(response);
  });
};

/**
 * Custom URL functionality
 */
this.set_custom_url = function (req, res) {
  businessUserCtrl.set_custom_url(req, res).then((response) => {
    res.send(response);
  });
};

this.find_business_by_custom_url = function (req, res) {
  businessUserCtrl.find_business_by_custom_url(req, res).then((response) => {
    res.send(response);
  });
};

this.check_custom_url_availability = function (req, res) {
  businessUserCtrl.check_custom_url_availability(req, res).then((response) => {
    res.send(response);
  });
};

/**
 * Direct User Lookup Endpoint
 * This is a simpler alternative to the read_business_user_by_name endpoint
 */
this.find_user_by_username = async function (req, res) {
  try {
    if (!req.body.user_public_name) {
      return res.send({
        success: false,
        message: "Missing username parameter",
      });
    }

    // Direct, simple MongoDB query - no filters, no complications
    const users = await BusinessUser.find({
      user_public_name: req.body.user_public_name,
    }).lean();

    if (users && users.length > 0) {
      return res.send({
        success: true,
        message: "Data fetched",
        details: users,
      });
    } else {
      // Try case-insensitive search as fallback
      const usersInsensitive = await BusinessUser.find({
        user_public_name: {
          $regex: new RegExp("^" + req.body.user_public_name + "$", "i"),
        },
      }).lean();

      if (usersInsensitive && usersInsensitive.length > 0) {
        return res.send({
          success: true,
          message: "Data fetched",
          details: usersInsensitive,
        });
      }

      return res.send({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.send({
      success: false,
      message: "Error searching for user",
      error: error.message,
    });
  }
};

this.send_otp_verification = function (req, res) {
  businessUserCtrl.send_otp_verification(req, res).then((response) => {
    res.send(response);
  });
};

this.verify_otp = function (req, res) {
  businessUserCtrl.verify_otp(req, res).then((response) => {
    res.send(response);
  });
};

this.login_business_user = function (req, res) {
  businessUserCtrl
    .login_business_user(req, res)
    .then((result) => {
      return res.send(result);
    })
    .catch((error) => {
      console.error("Error in login_business_user:", error);
      return res.status(500).send({
        success: false,
        message: "An error occurred during login",
        error: "SERVER_ERROR",
      });
    });
};

// hasthats.
this.create_hashtag = function (req, res) {
  hashtagCtrl.create_hashtag(req, res);
};
this.read_hashtag_all = function (req, res) {
  hashtagCtrl.read_hashtag_all(req, res);
};
this.delete_hashtag = function (req, res) {
  hashtagCtrl.delete_hashtag(req, res);
};
this.search_hashtags = function (req, res) {
  hashtagCtrl.search_hashtags(req, res);
};
this.update_hashtag_status = function (req, res) {
  hashtagCtrl.update_hashtag_status(req, res);
};
this.add_business_hashtag = function (req, res) {
  hashtagCtrl.add_business_hashtag(req, res);
};
this.get_business_hashtags = function (req, res) {
  hashtagCtrl.get_business_hashtags(req, res);
};
this.update_business_hashtag_limit = function (req, res) {
  hashtagCtrl.update_business_hashtag_limit(req, res);
};
