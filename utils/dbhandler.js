// Returns all hashtags for a business, regardless of status (for limit check)
module.exports.count_all_business_hashtags = function (businessId) {
  return new Promise(function (resolve, reject) {
    Hashtag.countDocuments({ business_id: businessId })
      .then((count) => {
        resolve(count);
      })
      .catch((error) => {
        resolve(0); // fallback to 0 on error
      });
  });
};
let BusinessCat = require("../models/model_business_category");
let InventoryCat = require("../models/model_inventory_category");
let BusinessSubCat = require("../models/model_business_subcategory");
let InventorySubCat = require("../models/model_inventory_subcategory");
let Inventory = require("../models/model_inventory");
let BusinessUser = require("../models/model_business_user");
let Collection = require("../models/model_collection");
let Project = require("../models/model_project");
let Blog = require("../models/model_blog");
let BusinessFilter = require("../models/model_business_filters");
let InventoryFilter = require("../models/model_inventory_filters");
let Admin = require("../models/model_admin");
let Search = require("../models/model_search");
let Tag = require("../models/model_tags");
let Country = require("../models/model_country");
let Materiallist = require("../models/model_materiallist");
let Projectplan = require("../models/model_projectplan");
let Contract = require("../models/model_contracts");
let Quote = require("../models/model_quotes");
let Quotesubmission = require("../models/model_quotesubmission");
let Hashtag = require("../models/model_hashtag");
let Settings = require("../models/model_setting");
let Notification = require("../controllers/notification_controller");
let InventorySc = require("../models/model_inventory");
let TagSc = require("../models/model_tags");

// Add these missing imports
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Rest of your existing imports...
let uniqid = require("uniqid");
let bcrypt = require("bcryptjs");
let salt = bcrypt.genSaltSync(10);
let Promise = require("bluebird");
let resObj = require("./response.js");
let utilObj = require("./utility.js");
let ConstantCtrl = require("./constants.js");
let fs = require("fs");
let jwt = require("jsonwebtoken");
let mongoxlsx = require("mongo-xlsx");
let Distance = require("geo-distance");
let isodate = require("isodate");
let _ = require("lodash");
let sortJsonArray = require("sort-json-array");

["log", "warn", "error"].forEach((a) => {
  let b = console[a];
  console[a] = (...c) => {
    try {
      throw new Error();
    } catch (d) {
      b.apply(console, [
        d.stack
          .split("\n")[2]
          .trim()
          .substring(3)
          .replace(__dirname, "")
          .replace(/\s\(./, " at ")
          .replace(/\)/, ""),
        "\n",
        ...c,
      ]);
    }
  };
});

///////////////////Business Category Handlers////////////////////////////////////////////////////////////////////////////////

module.exports.create_business_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    let businessCatID = uniqid();
    BusinessCat.create({
      business_category_id: businessCatID,
      business_category_name: req.body.business_category_name,
      business_category_name_ar: req.body.business_category_name_ar,
      business_category_type: req.body.business_category_type,
      business_category_icon: req.body.business_category_icon,
      business_category_img: req.body.business_category_img,
      business_category_theme_color: req.body.business_category_theme_color,
      created_by: req.body.created_by,
    })
      .then((businessContent) => {
        resolve(resObj.content_operation_responses("Created", businessContent));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

exports.get_business_category_by_id = function (business_category_id) {
  return new Promise(function (resolve, reject) {
    console.log("category-id", business_category_id);
    BusinessCat.findById(business_category_id)
      .then((category) => {
        if (category) {
          resolve({
            success: true,
            message: "Data fetched",
            details: category,
          });
        } else {
          resolve({
            success: false,
            message: "Business category not found",
            details: null,
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching business category by ID:", err);
        resolve({
          success: false,
          message: "Error fetching business category",
          details: err.message,
        });
      });
  });
};

module.exports.search_business_category = function (
  business_category_name,
  business_category_name_ar
) {
  return new Promise(function (resolve, reject) {
    BusinessCat.find()
      .or([
        { business_category_name: business_category_name },
        { business_category_name_ar: business_category_name_ar },
      ])
      //find({ "business_category_name" : business_category_name, "status" : "approved"})
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.search_business_category_public = function (
  business_category_name
) {
  return new Promise(function (resolve, reject) {
    BusinessCat.find({ status: "approved" })
      .or([
        {
          business_category_name: {
            $regex: business_category_name,
            $options: "i",
          },
        },
        {
          business_category_name_ar: {
            $regex: business_category_name,
            $options: "i",
          },
        },
      ])
      .exec()
      .then((resp) => {
        //console.log(resp.length);
        if (resp.length === 0) {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        } else {
          resolve(resObj.content_operation_responses("Fetch", resp));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_category_approved = function () {
  return new Promise(function (resolve, reject) {
    BusinessCat.find({ status: "approved" })
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_category_disapproved = function () {
  return new Promise(function (resolve, reject) {
    BusinessCat.find({ status: "disapproved" })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_category_all = function () {
  return new Promise(function (resolve, reject) {
    BusinessCat.find()
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_category_admin = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessCat.find(req.body.details)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_business_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessCat.findOne(
      {
        business_category_id: req.body.business_category_id,
        // Remove created_by if not needed or if it's empty
        // created_by: req.body.created_by,
      },
      function (err, businessdata) {
        if (err) {
          console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (businessdata) {
            businessdata.business_category_name =
              req.body.business_category_name ||
              businessdata.business_category_name;
            businessdata.business_category_name_ar =
              req.body.business_category_name_ar ||
              businessdata.business_category_name_ar;
            businessdata.created_by =
              req.body.created_by || businessdata.created_by;
            businessdata.business_category_theme_color =
              req.body.business_category_theme_color ||
              businessdata.business_category_theme_color;
            businessdata.business_category_img =
              req.body.business_category_img ||
              businessdata.business_category_img;
            businessdata.business_category_icon =
              req.body.business_category_icon ||
              businessdata.business_category_icon;
            businessdata.business_category_type =
              req.body.business_category_type ||
              businessdata.business_category_type;
            businessdata.status = req.body.status || businessdata.status;
            businessdata
              .save({ new: true })
              .then((result) => {
                resolve(resObj.content_operation_responses("Updated", result));
              })
              .catch((error) => {
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};
module.exports.delete_business_category = function (
  business_category_id,
  created_by
) {
  return new Promise(function (resolve, reject) {
    BusinessCat.findOne({
      business_category_id: business_category_id,
      created_by: created_by,
    })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//////////////////Business Subcategory Handlers///////////////////////////////////////////////////////////////////////////////
module.exports.create_business_subcategory = function (req, res) {
  return new Promise(function (resolve, reject) {
    let businessSubCatID = uniqid();
    BusinessSubCat.create({
      business_subcategory_id: businessSubCatID,
      business_category_name: req.body.business_category_name,
      business_category_name_ar: req.body.business_category_name_ar,
      business_category_oid: req.body.business_category_oid,
      business_subcategory_name: req.body.business_subcategory_name,
      business_subcategory_name_ar: req.body.business_subcategory_name_ar,
      business_subcategory_type: req.body.business_subcategory_type,
      business_subcategory_img: req.body.business_subcategory_img,
      business_subcategory_icon: req.body.business_subcategory_icon,
      business_subcategory_theme_color:
        req.body.business_subcategory_theme_color,
      created_by: req.body.created_by,
    })
      .then((businessContent) => {
        resolve(resObj.content_operation_responses("Created", businessContent));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.search_business_subcategory = function (
  business_subcategory_name,
  business_subcategory_name_ar,
  business_category_oid
) {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.find()
      .or([
        { business_subcategory_name: business_subcategory_name },
        { business_subcategory_name_ar: business_subcategory_name_ar },
      ])
      //find({ "business_subcategory_name" : business_subcategory_name, "status" : "approved"})
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.search_business_subcategory_public = function (
  business_subcategory_name
) {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.find({ status: "approved" })
      .or([
        {
          business_subcategory_name: {
            $regex: business_subcategory_name,
            $options: "i",
          },
        },
        {
          business_subcategory_name_ar: {
            $regex: business_subcategory_name,
            $options: "i",
          },
        },
      ])
      //.find({ "business_subcategory_name" : { $regex: business_subcategory_name, $options: 'i' }, "status" : "approved"})
      .populate("business_category_oid")
      .exec()
      .then((resp) => {
        //console.log(resp.length);
        if (resp.length === 0) {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        } else {
          resolve(resObj.content_operation_responses("Fetch", resp));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_subcategory_approved = function () {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.find({ status: "approved" })
      .populate("business_category_oid")
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_subcategory_disapproved = function () {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.find({ status: "disapproved" })
      .populate("business_category_oid")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_subcategory_all = function () {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.find()
      .populate("business_category_oid")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_subcategory_admin = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.find(req.body.details)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_business_subcategory_by_category = function (category_oid) {
  return new Promise(function (resolve, reject) {
    category_oid = ObjectId(category_oid);
    BusinessSubCat.find({
      status: "approved",
      business_category_oid: category_oid,
    })
      .populate("business_category_oid")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_business_subcategory = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.findOne(
      {
        business_subcategory_id: req.body.business_subcategory_id,
        created_by: req.body.created_by,
      },
      function (err, businessdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (businessdata) {
            businessdata.business_subcategory_name =
              req.body.business_subcategory_name ||
              businessdata.business_subcategory_name;
            businessdata.business_subcategory_name_ar =
              req.body.business_subcategory_name_ar ||
              businessdata.business_subcategory_name_ar;
            businessdata.business_subcategory_theme_color =
              req.body.business_subcategory_theme_color ||
              businessdata.business_subcategory_theme_color;
            businessdata.business_subcategory_img =
              req.body.business_subcategory_img ||
              businessdata.business_subcategory_img;
            businessdata.business_subcategory_icon =
              req.body.business_subcategory_icon ||
              businessdata.business_subcategory_icon;
            businessdata.business_subcategory_type =
              req.body.business_subcategory_type ||
              businessdata.business_subcategory_type;
            businessdata.business_category_name =
              req.body.business_category_name ||
              businessdata.business_category_name;
            businessdata.business_category_name_ar =
              req.body.business_category_name_ar ||
              businessdata.business_category_name_ar;
            businessdata.business_category_oid =
              ObjectId(req.body.business_category_oid) ||
              businessdata.business_category_oid;
            businessdata.status = req.body.status || businessdata.status;
            businessdata
              .save({ new: true })
              .then((result) => {
                resolve(resObj.content_operation_responses("Updated", result));
              })
              .catch((error) => {
                //console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_business_subcategory = function (
  business_subcategory_id,
  created_by
) {
  return new Promise(function (resolve, reject) {
    BusinessSubCat.findOne({
      business_subcategory_id: business_subcategory_id,
      created_by: created_by,
    })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

////////////////////////Business User handlers/////////////////////////////////////////////////////////////////////

module.exports.find_business_user = function (user_email_or_fid) {
  return new Promise(function (resolve, reject) {
    // First try to find by email
    BusinessUser.find({ user_email: user_email_or_fid })
      .populate("business_category")
      .populate("business_subcategory")
      .exec()
      .then((emailResp) => {
        if (emailResp && emailResp.length > 0) {
          // User found by email
          resolve(emailResp);
        } else {
          // User not found by email, try to find by Facebook ID
          BusinessUser.find({ user_fid: user_email_or_fid })
            .populate("business_category")
            .populate("business_subcategory")
            .exec()
            .then((fidResp) => {
              resolve(fidResp);
            })
            .catch((error) => {
              console.error("Error finding user by Facebook ID:", error);
              resolve([]);
            });
        }
      })
      .catch((error) => {
        console.error("Error finding user by email:", error);
        resolve([]);
      });
  });
};

module.exports.search_business_by_user_name = function (user_name) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find({
      user_name: { $regex: user_name, $options: "i" },
      user_name,
      user_status: "approved",
    })
      .populate("business_category")
      .populate("business_subcategory")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

// password would be 123456
module.exports.create_bulk_users = function (usersData) {
  return new Promise(async (resolve, reject) => {
    const defaultPassword = "123456";
    const saltRounds = 10;
    const decrpytedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    try {
      for (var i = 0; i < usersData.length; i++) {
        const user = usersData[i];

        // Check if user already exist then skip
        let isExist = await BusinessUser.findOne({
          user_email: user.user_email,
        });
        if (isExist) {
          continue;
        }

        let businessuserID = uniqid();
        await BusinessUser.create({
          user_id: businessuserID,
          user_type: "Business",
          user_email: user.user_email,
          user_name: user.user_name,
          user_public_name: user.user_public_name,
          user_password: decrpytedPassword,
          user_country: user.user_country,
          user_phone: user.user_phone,
          business_type: user.business_type,
          business_name_english: user.business_name_english,
          business_name_arabic: user.business_name_arabic,
          business_description_english: user.business_description_english,
          business_description_arabic: user.business_description_arabic,
          location_lat: user.location_lat,
          location_long: user.location_long,
          fb_link: user.fb_link,
          instagram_link: user.instagram_link,
          twitter_link: user.twitter_link,
          web_link: user.web_link,
        });
      }

      resolve(resObj.content_operation_responses("Created"));
    } catch (error) {
      if (error) {
        resolve(resObj.content_operation_responses("Error", error));
      }
    }
  });
};

module.exports.create_business_user_simple = function (
  user_type,
  user_public_name,
  user_email,
  user_password,
  user_fcm,
  custom_url,
  whoCreated = "",
  noofquotes = "",
  max_hashtags = "",
  business_hours = [],
  leisure_hours = [],
  logo = "",
  cover_image = "",
  cover_image_title_english = "",
  cover_image_title_arabic = "",
  cover_image_description_english = "",
  cover_image_description_arabic = "",
  business_name = "",
  business_name_english = "",
  business_name_ar = "",
  business_description = "",
  business_description_ar = "",
  business_email = "",
  business_phone = "",
  business_website = "",
  business_address = "",
  business_address_ar = "",
  business_city = "",
  business_category = [],
  business_subcategories = [],
  user_status = "pending",
  business_type = "",
  user_country = "",
  fb_link = "",
  instagram_link = "",
  youtube_link = "",
  twitter_link = "",
  web_link = "",
  address = "",
  address_ar = "",
  location_lat = "",
  location_long = "",
  branch_name = "",
  branch_name_ar = ""
) {
  return new Promise(function (resolve, reject) {
    let businessuserID = uniqid();
    const saltRounds = 10;
    bcrypt
      .hash(user_password, saltRounds)
      .then((hash) => {
        return hash;
      })
      .then((password) => {
        // Create user object with basic fields
        let userObj = {
          user_id: businessuserID,
          user_type: user_type,
          user_email: user_email,
          user_public_name: user_public_name,
          user_fcm: user_fcm,
          user_password: password,
          user_status: user_status, // Set status (admin-created users will be "approved")
        }; // Add business information fields (assign even if empty string)

        userObj.noofquotes = noofquotes || "";
        userObj.max_hashtags = max_hashtags || "";
        userObj.business_name = business_name || "";
        userObj.business_name_english =
          business_name_english || business_name || "";
        userObj.business_name_ar = business_name_ar || "";
        userObj.business_description = business_description || "";
        userObj.business_description_english = business_description || "";
        userObj.business_description_arabic = business_description_ar || "";
        userObj.business_email = business_email || "";
        userObj.business_phone = business_phone || "";
        userObj.business_website = business_website || "";
        userObj.web_link = web_link || business_website || "";
        userObj.business_address = business_address || address || "";
        userObj.address = address || business_address || "";
        userObj.business_address_ar = business_address_ar || address_ar || "";
        userObj.address_ar = address_ar || business_address_ar || "";
        userObj.business_city = business_city || "";
        userObj.business_category = business_category || [];
        userObj.business_subcategory = business_subcategories || [];
        userObj.user_phone = business_phone || "";
        userObj.business_type = business_type || "";
        userObj.user_country = user_country || "";
        userObj.location_lat = location_lat || "";
        userObj.location_long = location_long || "";
        userObj.branch_name_ar = branch_name_ar || ""; // Add Arabic branch_name field
        userObj.branch_name = branch_name || "";

        userObj.cover_image_title_english = cover_image_title_english || "";
        userObj.cover_image_title_arabic = cover_image_title_arabic || "";
        userObj.cover_image_description_english =
          cover_image_description_english || "";
        userObj.cover_image_description_arabic =
          cover_image_description_arabic || "";

        // Add social media links
        userObj.fb_link = fb_link || "";
        userObj.instagram_link = instagram_link || "";
        userObj.youtube_link = youtube_link || "";
        userObj.twitter_link = twitter_link || "";

        userObj.logo = logo || "";
        userObj.cover_image = cover_image || ""; // Add custom URL if provided
        if (custom_url) {
          userObj.custom_url = custom_url;
        }
        // Add business_hours if provided
        let parsedBusinessHours = [];
        if (business_hours) {
          try {
            // Handle multiple levels of stringification
            let hoursData = business_hours;

            while (typeof hoursData === "string") {
              hoursData = JSON.parse(hoursData);
            }

            // Now hoursData should be an array
            if (Array.isArray(hoursData)) {
              // Filter out days with empty from/to times
              parsedBusinessHours = hoursData.filter((day) => {
                if (!day.from || !day.to) return false;
                if (day.from === "" || day.to === "") return false;
                // Handle object format for time picker
                if (
                  typeof day.from === "object" &&
                  (!day.from.hh || !day.from.mm)
                )
                  return false;
                if (typeof day.to === "object" && (!day.to.hh || !day.to.mm))
                  return false;
                return true;
              });

              userObj.business_hours = parsedBusinessHours;
            } else {
              userObj.business_hours = [];
            }
          } catch (e) {
            console.error("Error parsing business_hours:", e);
            userObj.business_hours = [];
          }
        } else {
          userObj.business_hours = [];
        }
        // Add leisure_hours if provided
        let parsedLeisureHours = [];
        if (leisure_hours) {
          try {
            // Handle multiple levels of stringification
            let hoursData = leisure_hours;

            // If it's a string, try to parse it (potentially multiple times)
            while (typeof hoursData === "string") {
              hoursData = JSON.parse(hoursData);
            }

            // Now hoursData should be an array
            if (Array.isArray(hoursData)) {
              // Filter out days with empty from/to times
              parsedLeisureHours = hoursData.filter((day) => {
                if (!day.from || !day.to) return false;
                if (day.from === "" || day.to === "") return false;
                // Handle object format for time picker
                if (
                  typeof day.from === "object" &&
                  (!day.from.hh || !day.from.mm)
                )
                  return false;
                if (typeof day.to === "object" && (!day.to.hh || !day.to.mm))
                  return false;
                return true;
              });

              userObj.leisure_hours = parsedLeisureHours;
            } else {
              userObj.leisure_hours = [];
            }
          } catch (e) {
            console.error("Error parsing leisure_hours:", e);
            console.error("Raw leisure_hours value:", leisure_hours);
            userObj.leisure_hours = [];
          }
        } else {
          userObj.leisure_hours = [];
        } // Initialize branches array with a main branch
        userObj.branches = [
          {
            name:
              userObj.business_name_english ||
              userObj.business_name ||
              userObj.user_public_name ||
              "Main Branch",
            name_ar: userObj.business_name_ar || "",
            branch_name: userObj.branch_name || "", // Add branch_name field for main branch
            branch_name_ar: userObj.branch_name_ar || "", // Add Arabic branch_name field for main branch
            phone: userObj.business_phone || "",
            address: userObj.business_address || userObj.address || "",
            address_ar: userObj.business_address_ar || userObj.address_ar || "",
            location_lat: location_lat || "",
            location_long: location_long || "",
            business_hours: parsedBusinessHours || [],
            leisure_hours: parsedLeisureHours || [],
            city: userObj.business_city || "",
            city_ar: userObj.business_city_ar || "",
            is_main: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        return BusinessUser.create(userObj);
      })
      .then((userContent) => {
        // First remove sensitive data
        userContent.user_password = undefined;

        // If we have category or subcategory IDs, populate them
        if (
          (userContent.business_category &&
            userContent.business_category.length > 0) ||
          (userContent.business_subcategory &&
            userContent.business_subcategory.length > 0)
        ) {
          return BusinessUser.findById(userContent._id)
            .populate("business_category")
            .populate("business_subcategory")
            .exec()
            .then((populatedUser) => {
              if (populatedUser) {
                populatedUser.user_password = undefined;
                resolve(resObj.register_resp("Registered", populatedUser));
              } else {
                // If populate fails for some reason, still return the unpopulated user
                resolve(resObj.register_resp("Registered", userContent));
              }
            })
            .catch((populateError) => {
              console.log(
                "Error populating business categories:",
                populateError
              );
              // Still return the unpopulated user on error
              resolve(resObj.register_resp("Registered", userContent));
            });
        } else {
          // No categories/subcategories to populate, return as is
          resolve(resObj.register_resp("Registered", userContent));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.register_resp("Error", error));
      });
  });
};

module.exports.create_business_user_gmail = function (
  user_type,
  user_public_name,
  user_email,
  user_fcm,
  user_gid,
  user_dp
) {
  return new Promise(function (resolve, reject) {
    let businessuserID = uniqid();
    BusinessUser.create({
      user_id: businessuserID,
      user_type: user_type,
      user_public_name: user_public_name,
      user_email: user_email,
      user_fcm: user_fcm,
      user_gid: user_gid,
      user_dp: user_dp,
      user_status: "approved", // Ensure status is approved for Google accounts
    })
      .then((userContent) => {
        userContent.user_password = undefined;
        resolve(resObj.register_resp("Registered", userContent));
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_business_user_fb = function (
  user_type,
  user_public_name,
  user_email,
  user_fcm,
  user_fid,
  user_dp
) {
  return new Promise(function (resolve, reject) {
    let businessuserID = uniqid();
    BusinessUser.create({
      user_id: businessuserID,
      user_type: user_type,
      user_public_name: user_public_name,
      user_email: user_email,
      user_fcm: user_fcm,
      user_fid: user_fid,
      user_dp: user_dp,
      user_status: "approved", // Ensure status is approved for Facebook accounts
    })
      .then((userContent) => {
        userContent.user_password = undefined;
        resolve(resObj.register_resp("Registered", userContent));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.read_business_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find(
      { user_type: "Business", user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .skip(parseInt(req.body.offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};
module.exports.read_user_details = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find(
      { user_id: req.body.user_id, user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .skip(parseInt(req.body.offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.follow_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    let thisUserId = req.body.thisUserId;
    let targetUserId = req.body.targetUserId;
    BusinessUser.findOne({ user_id: thisUserId })
      .then(async (data) => {
        if (!data)
          if (!data)
            resolve(resObj.user_operation_responses("Error", "User not found"));
        if (!data.user_following.includes(targetUserId)) {
          data.user_following.push(targetUserId);
          await BusinessUser.updateOne({ user_id: thisUserId }, data);
        }
      })
      .catch((error) =>
        resolve(resObj.user_operation_responses("Error", error))
      );
    BusinessUser.findOne({ user_id: targetUserId })
      .then(async (data) => {
        if (!data)
          if (!data)
            resolve(resObj.user_operation_responses("Error", "User not found"));
        if (!data.user_followers.includes(thisUserId)) {
          data.user_followers.push(thisUserId);
          await BusinessUser.updateOne({ user_id: targetUserId }, data);
        }
      })
      .catch((error) =>
        resolve(resObj.user_operation_responses("Error", error))
      );
    resolve(resObj.user_operation_responses("Followed"));
  });
};
module.exports.unfollow_user = function (req, res) {
  return new Promise(function (resolve, reject) {
    let thisUserId = req.body.thisUserId;
    let targetUserId = req.body.targetUserId;
    BusinessUser.findOne({ user_id: thisUserId })
      .then(async (data) => {
        if (!data)
          if (!data)
            resolve(resObj.user_operation_responses("Error", "User not found"));
        if (data.user_following.includes(targetUserId)) {
          data.user_following = data.user_following.filter(
            (id) => id !== targetUserId
          );
          await BusinessUser.updateOne({ user_id: thisUserId }, data);
        }
      })
      .catch((error) =>
        resolve(resObj.user_operation_responses("Error", error))
      );
    BusinessUser.findOne({ user_id: targetUserId })
      .then(async (data) => {
        if (!data)
          if (!data)
            resolve(resObj.user_operation_responses("Error", "User not found"));
        if (data.user_followers.includes(thisUserId)) {
          data.user_followers = data.user_followers.filter(
            (id) => id !== thisUserId
          );
          await BusinessUser.updateOne({ user_id: targetUserId }, data);
        }
      })
      .catch((error) =>
        resolve(resObj.user_operation_responses("Error", error))
      );
    resolve(resObj.user_operation_responses("Unfollowed"));
  });
};
module.exports.user_followers = function (req, res) {
  return new Promise(function (resolve, reject) {
    let user_id = req.body.user_id;
    BusinessUser.findOne({ user_id: user_id })
      .then((data) => {
        if (!data) {
          resolve(resObj.user_operation_responses("Error", "User not found"));
          return; // Add return to prevent further execution
        }
        resolve(
          resObj.user_operation_responses("Fetch", data.user_followers || [])
        );
      })
      .catch((error) => {
        console.error("Error in user_followers:", error);
        resolve(
          resObj.user_operation_responses(
            "Error",
            error.message || "An error occurred"
          )
        );
      });
  });
};
module.exports.user_following = function (req, res) {
  return new Promise(function (resolve, reject) {
    let user_id = req.body.user_id;
    BusinessUser.findOne({ user_id: user_id })
      .then((data) => {
        if (!data) {
          resolve(resObj.user_operation_responses("Error", "User not found"));
          return; // Add return to prevent further execution
        }
        resolve(resObj.user_operation_responses("Fetch", data.user_following));
      })
      .catch((error) => {
        console.error("Error in user_following:", error);
        resolve(
          resObj.user_operation_responses(
            "Error",
            error.message || "An error occurred"
          )
        );
      });
  });
};

module.exports.get_suggested_businesses = function (req, res) {
  return new Promise(function (resolve, reject) {
    let user_id = req.body.user_id;
    // Get all business in same category & subcategory and remove followed ones
    BusinessUser.findOne({ user_id: user_id }).then((data) => {
      if (!data)
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      let userCategory = data.business_category;
      let userSubcategory = data.business_subcategory;

      BusinessUser.find({
        business_category: { $in: userCategory },
        business_subcategory: { $in: userSubcategory },
      }).then((data2) => {
        if (!data2)
          if (!data)
            resolve(resObj.user_operation_responses("Error", "User not found"));
        let suggestedBusinesses = [];
        data2.map((item) => {
          if (!data.user_following.includes(item._id)) {
            suggestedBusinesses.push(item);
          }
        });
        console.log("sending suggested businesses");
        resolve(
          resObj.content_operation_responses("Fetch", suggestedBusinesses)
        );
      });
    });
  });
};

module.exports.verify_business_by_oid = function (user_oid) {
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne({ _id: user_oid }, function (err, businessdata) {
      if (err) {
        console.log(err);
        resolve(resObj.content_operation_responses("Error", err));
      } else {
        businessdata.user_status = "approved";
        businessdata.save({ new: true }).then((result) => {
          BusinessUser.findOne({ _id: user_oid }, { user_password: 0 })
            .populate("business_category")
            .populate("business_subcategory")
            .exec()
            .then((resp) => {
              resolve(resObj.register_resp("LoggedIn", resp));
            });
        });
      }
    });
  });
};

module.exports.read_business_user_by_id = function (user_id) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find({ user_id: user_id }, { user_password: 0 })
      .populate("business_category")
      .populate("business_subcategory")
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.read_business_user_by_distance = function (
  lat,
  lon,
  distance,
  offset
) {
  return new Promise(function (resolve, reject) {
    let resArr = [];
    let usrLoc = {
      lat: lat,
      lon: lon,
    };
    BusinessUser.find({ user_status: "approved" }, { user_password: 0 })
      .populate("business_category")
      .populate("business_subcategory")
      .exec()
      .then((resp) => {
        Promise.each(resp, function (usrVal) {
          let destination = {
            lat: usrVal.location_lat,
            lon: usrVal.location_long,
          };
          let dist = Distance.between(usrLoc, destination);
          if (dist <= Distance(distance)) {
            resArr.push({
              businessData: usrVal,
              distance: "" + dist.human_readable(),
            });
            // console.log("Here");
          }
          return "anything";
        }).then(function (result) {
          console.log(resArr);
          if (resArr.length > 0) {
            resolve(resObj.user_operation_responses("DistanceFilter", resArr));
          } else {
            resolve(resObj.user_operation_responses("Unavailable", "NA"));
          }
        });
      });
  });
};
calculate_distance_internal = function (data, lat, lon, distance) {
  return new Promise(function (resolve, reject) {
    let resArr = [];
    let usrLoc = {
      lat: lat,
      lon: lon,
    };

    Promise.each(data, function (usrVal) {
      //console.log(usrVal);
      let destination = {
        lat: usrVal.location_lat,
        lon: usrVal.location_long,
      };
      let dist = Distance.between(usrLoc, destination);
      console.log(
        "---------------" + "Distance is" + dist + "-------------------------"
      );
      if (dist <= Distance(distance)) {
        //console.log(dist);
        console.log("Entered distance logic");
        resArr.push({
          businessData: usrVal,
          distance: "" + dist.human_readable(),
        });
        //console.log(resArr);
      }
      return "anything";
    }).then(function (result) {
      //console.log(resArr);
      if (resArr.length > 0) {
        //console.log("Touched here");
        resolve(resArr);
        //resolve(resObj.user_operation_responses("DistanceFilter", resArr))
      } else {
        resolve("Not found");
      }
      // else{
      // //resolve(resObj.user_operation_responses("Unavailable", "NA"))
      // }
    });
  });
};
module.exports.read_business_user_by_city = function (city, offset) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find(
      { business_city: city, user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .skip(parseInt(offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};
module.exports.read_business_user_by_category = function (
  business_category_oid,
  offset
) {
  return new Promise(function (resolve, reject) {
    category_oid = ObjectId(business_category_oid);
    BusinessUser.find(
      { business_category: category_oid, user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .skip(parseInt(offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};
module.exports.read_business_user_by_subcategory = function (
  business_subcategory_oid,
  offset
) {
  return new Promise(function (resolve, reject) {
    subcategory_oid = ObjectId(business_subcategory_oid);
    BusinessUser.find(
      { business_subcategory: subcategory_oid, user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .skip(parseInt(offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};
module.exports.read_business_user_by_type = function (type, offset) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find(
      { business_type: type, user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .skip(parseInt(offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};
module.exports.read_business_user_by_space = function (space, offset) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find(
      { business_space: space, user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .skip(parseInt(offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};
module.exports.read_business_user_by_brand = function (brand, offset) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find(
      { business_brand: brand, user_status: "approved" },
      { user_password: 0 }
    )
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .skip(parseInt(offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.read_business_user_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.search_term) {
      let date = new Date();
      date = date.toISOString().slice(0, 10);
      // console.log(req.body.search_term);
      // console.log(req.body.search_type);
      Search.findOneAndUpdate(
        {
          search_term: req.body.search_term,
          search_type: req.body.search_type,
          updated_at: date,
        },
        { $inc: { search_count: 1 } },
        { upsert: true }
      )
        .exec()
        .then((response) => {
          if (response) {
            console.log("Search term added/updated");
          }
        });
    }
    let detailValue = req.body.details;
    let details = {};

    if (req.body.business_name_english) {
      //details = {$and : [{$or : [{item_name: { $regex: req.body.item_name, $options: 'i' }},{item_tags : {$regex : req.body.item_name, $options : 'i'}},{item_description : {$regex : req.body.item_name, $options : 'i'}},{item_name_ar : {$regex : req.body.item_name, $options : 'i'}},{item_description_ar : {$regex : req.body.item_name, $options : 'i'}}]},detailValue]};
      details = {
        $and: [
          {
            $or: [
              {
                business_name_english: {
                  $regex: req.body.business_name_english,
                  $options: "i",
                },
              },
              {
                business_description_english: {
                  $regex: req.body.business_name_english,
                  $options: "i",
                },
              },
              {
                business_name_arabic: {
                  $regex: req.body.business_name_english,
                  $options: "i",
                },
              },
              {
                business_description_arabic: {
                  $regex: req.body.business_name_english,
                  $options: "i",
                },
              },
            ],
          },
          detailValue,
        ],
      };
    } else if (req.body.business_name_arabic) {
      //details = {$or : [{business_name_arabic: { $regex: req.body.business_name_arabic, $options: 'i' }}, {business_description_arabic : {$regex : req.body.business_name_arabic, $options : 'i'}},{business_name_english: { $regex: req.body.business_name_arabic, $options: 'i' }}, {business_description_english : {$regex : req.body.business_name_arabic, $options: 'i'}}], ...detailValue};
      details = {
        $and: [
          {
            $or: [
              {
                business_name_arabic: {
                  $regex: req.body.business_name_arabic,
                  $options: "i",
                },
              },
              {
                business_description_arabic: {
                  $regex: req.body.business_name_arabic,
                  $options: "i",
                },
              },
              {
                business_name_english: {
                  $regex: req.body.business_name_arabic,
                  $options: "i",
                },
              },
              {
                business_description_english: {
                  $regex: req.body.business_name_arabic,
                  $options: "i",
                },
              },
            ],
          },
          detailValue,
        ],
      };
    } else {
      details = detailValue;
    }

    console.log("details :>> ", details);

    BusinessUser.find(details, { user_password: 0 })
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ business_featured: -1, created_at: -1 })
      .skip(parseInt(req.body.offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp.length);
        if (resp.length > 0) {
          if (req.body.distance) {
            console.log("Entered Distance block");
            this.calculate_distance_internal(
              resp,
              req.body.lat,
              req.body.long,
              req.body.distance
            ).then((respArr) => {
              if (respArr === "Not found") {
                resolve(resObj.user_operation_responses("Unavailable", "NA"));
              } else {
                resolve(
                  resObj.user_operation_responses("DistanceFilter", respArr)
                );
              }
            });
          } else {
            resolve(resObj.user_operation_responses("Fetch", resp));
          }
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.read_businessuser_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessUser.find(req.body.details, { user_password: 0 })
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.read_user_by_timeline = function (start, end) {
  return new Promise(function (resolve, reject) {
    let start_date = isodate(start);
    let end_date = isodate(end);
    BusinessUser.find({
      created_at: {
        $gte: start_date,
        $lt: end_date,
      },
    })
      .count()
      .then((resp) => {
        console.log(resp);
        if (resp) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.read_business_user_by_timeline = function (start, end) {
  return new Promise(function (resolve, reject) {
    let start_date = isodate(start);
    let end_date = isodate(end);
    BusinessUser.find({
      business_user_since: {
        $gte: start_date,
        $lt: end_date,
      },
    })
      .count()
      .then((resp) => {
        console.log(resp);
        if (resp) {
          resolve(resObj.user_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.user_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.update_business_user_for_login_gmail = function (
  user_type,
  user_name,
  user_name_public,
  user_email,
  user_fcm,
  user_gid,
  user_dp
) {
  return new Promise(async function (resolve, reject) {
    try {
      const businessdata = await BusinessUser.findOne({
        user_email: user_email,
      });

      if (!businessdata) {
        resolve(
          resObj.user_operation_responses("Unavailable", "User not found")
        );
        return;
      }

      businessdata.user_email = user_email || businessdata.user_email;
      businessdata.user_name = user_name || businessdata.user_name;
      businessdata.user_name_public =
        user_name_public || businessdata.user_name_public;
      businessdata.user_fcm = user_fcm || businessdata.user_fcm;
      businessdata.user_type = user_type || businessdata.user_type;
      businessdata.user_gid = user_gid || businessdata.user_gid;
      businessdata.user_dp = user_dp || businessdata.user_dp;
      businessdata.user_status = "approved";
      await businessdata.save({ new: true });

      const updatedUser = await BusinessUser.findOne(
        { user_email: user_email },
        { user_password: 0 }
      )
        .populate("business_category")
        .populate("business_subcategory")
        .exec();

      const jwt = require("jsonwebtoken");
      const ConstantCtrl = require("./constants.js");

      const token = jwt.sign(
        { user_email: updatedUser.user_email, userId: updatedUser._id },
        ConstantCtrl.JWT_SECRET,
        { expiresIn: "15d" }
      );

      resolve({
        success: true,
        user_details: [updatedUser],
        user_token: token,
      });
    } catch (error) {
      console.error("Error in update_business_user_for_login_gmail:", error);
      resolve(resObj.content_operation_responses("Error", error));
    }
  });
};

module.exports.update_business_user_for_login_fb = function (
  user_type,
  user_name,
  user_name_public,
  user_email,
  user_fcm,
  user_fid,
  user_dp
) {
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne(
      { user_email: user_email },
      function (err, businessdata) {
        if (err) {
          console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          businessdata.user_email = user_email || businessdata.user_email;
          businessdata.user_name = user_name || businessdata.user_name;
          businessdata.user_name_public =
            user_name_public || businessdata.user_name_public;
          businessdata.user_fcm = user_fcm || businessdata.user_fcm;
          businessdata.user_type = user_type || businessdata.user_type;
          businessdata.user_fid = user_fid || businessdata.user_fid;
          businessdata.user_dp = user_dp || businessdata.user_dp;
          businessdata.user_status = "approved"; // Ensure user is approved when logging in with Facebook
          businessdata.save({ new: true }).then((result) => {
            BusinessUser.findOne(
              { user_email: user_email },
              { user_password: 0 }
            )
              .populate("business_category")
              .populate("business_subcategory")
              .exec()
              .then((resp) => {
                resolve(resObj.register_resp("LoggedIn", resp));
              });
          });
        }
      }
    );
  });
};

module.exports.update_business_user = function (req, res) {
  let user_type = "";
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne(
      { user_email: req.body.user_email },
      function (err, businessdata) {
        if (err) {
          console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (businessdata) {
            if (req.body.business_user_since) {
              businessdata.business_user_since =
                isodate(req.body.business_user_since) ||
                businessdata.business_user_since;
            }
            user_type = businessdata.user_type;
            businessdata.user_type =
              req.body.user_type || businessdata.user_type;
            businessdata.user_name =
              req.body.user_name || businessdata.user_name;
            businessdata.user_public_name =
              req.body.user_public_name || businessdata.user_public_name;
            businessdata.user_email =
              req.body.user_email || businessdata.user_email;
            businessdata.user_fcm = req.body.user_fcm || businessdata.user_fcm;
            businessdata.user_gid = req.body.user_gid || businessdata.user_gid;
            businessdata.user_fid = req.body.user_fid || businessdata.user_fid;
            businessdata.user_dp = req.body.user_dp || businessdata.user_dp;
            businessdata.user_phone =
              req.body.user_phone || businessdata.user_phone;
            businessdata.user_fid = req.body.user_fid || businessdata.user_fid;
            businessdata.user_language =
              req.body.user_language || businessdata.user_language;
            businessdata.user_country =
              req.body.user_country || businessdata.user_country;
            businessdata.user_status =
              req.body.user_status || businessdata.user_status; // Handle custom URL updates
            if (req.body.custom_url) {
              // Only update if it's changed or doesn't exist
              if (
                !businessdata.custom_url ||
                businessdata.custom_url !== req.body.custom_url
              ) {
                businessdata.custom_url = req.body.custom_url;
              }
            }
            businessdata.business_name_english =
              req.body.business_name_english ||
              businessdata.business_name_english;
            businessdata.business_name_arabic =
              req.body.business_name_arabic ||
              businessdata.business_name_arabic;
            businessdata.business_category =
              req.body.business_category || businessdata.business_category;
            businessdata.business_subcategory =
              req.body.business_subcategory ||
              businessdata.business_subcategory;
            businessdata.business_email =
              req.body.business_email || businessdata.business_email;
            businessdata.business_type =
              req.body.business_type || businessdata.business_type;
            businessdata.business_brand =
              req.body.business_brand || businessdata.business_brand;
            businessdata.business_brand_ar =
              req.body.business_brand_ar || businessdata.business_brand_ar;
            businessdata.business_space =
              req.body.business_space || businessdata.business_space;
            businessdata.business_space_ar =
              req.body.business_space_ar || businessdata.business_space_ar;
            businessdata.business_city =
              req.body.business_city || businessdata.business_city;
            businessdata.business_city_ar =
              req.body.business_city_ar || businessdata.business_city_ar;

            // Parse business_hours with the same logic as create function
            if (req.body.business_hours) {
              try {
                let hoursData = req.body.business_hours;
                while (typeof hoursData === "string") {
                  hoursData = JSON.parse(hoursData);
                }
                if (Array.isArray(hoursData)) {
                  let parsedBusinessHours = hoursData.filter((day) => {
                    if (!day.from || !day.to) return false;
                    if (day.from === "" || day.to === "") return false;
                    if (
                      typeof day.from === "object" &&
                      (!day.from.hh || !day.from.mm)
                    )
                      return false;
                    if (
                      typeof day.to === "object" &&
                      (!day.to.hh || !day.to.mm)
                    )
                      return false;
                    return true;
                  });
                  businessdata.business_hours = parsedBusinessHours;
                } else {
                  businessdata.business_hours = [];
                }
              } catch (e) {
                console.error("Error parsing business_hours in update:", e);
                businessdata.business_hours = [];
              }
            }

            // Parse leisure_hours with the same logic as create function
            if (req.body.leisure_hours) {
              try {
                let hoursData = req.body.leisure_hours;
                while (typeof hoursData === "string") {
                  hoursData = JSON.parse(hoursData);
                }
                if (Array.isArray(hoursData)) {
                  let parsedLeisureHours = hoursData.filter((day) => {
                    if (!day.from || !day.to) return false;
                    if (day.from === "" || day.to === "") return false;
                    if (
                      typeof day.from === "object" &&
                      (!day.from.hh || !day.from.mm)
                    )
                      return false;
                    if (
                      typeof day.to === "object" &&
                      (!day.to.hh || !day.to.mm)
                    )
                      return false;
                    return true;
                  });
                  businessdata.leisure_hours = parsedLeisureHours;
                } else {
                  businessdata.leisure_hours = [];
                }
              } catch (e) {
                console.error("Error parsing leisure_hours in update:", e);
                businessdata.leisure_hours = [];
              }
            }

            businessdata.location_lat =
              req.body.location_lat || businessdata.location_lat;
            businessdata.location_long =
              req.body.location_long || businessdata.location_long;
            businessdata.address = req.body.address || businessdata.address;
            businessdata.address_ar =
              req.body.address_ar || businessdata.address_ar;
            businessdata.logo = req.body.logo || businessdata.logo;
            businessdata.cover_image =
              req.body.cover_image || businessdata.cover_image;
            businessdata.deals_in = req.body.deals_in || businessdata.deals_in;
            businessdata.noofquotes =
              req.body.noofquotes || businessdata.noofquotes;
            businessdata.max_hashtags =
              req.body.max_hashtags || businessdata.max_hashtags;
            businessdata.business_description_english =
              req.body.business_description_english ||
              businessdata.business_description_english;
            businessdata.business_description_arabic =
              req.body.business_description_arabic ||
              businessdata.business_description_arabic;
            businessdata.web_link = req.body.web_link || businessdata.web_link;
            businessdata.fb_link = req.body.fb_link || businessdata.fb_link;
            businessdata.instagram_link =
              req.body.instagram_link || businessdata.instagram_link;
            businessdata.youtube_link =
              req.body.youtube_link || businessdata.youtube_link;
            businessdata.twitter_link =
              req.body.twitter_link || businessdata.twitter_link;
            businessdata.ratings = req.body.ratings || businessdata.ratings;
            businessdata.business_featured =
              req.body.business_featured || businessdata.business_featured;
            businessdata.save({ new: true }).then((result) => {
              BusinessUser.findOne(
                { user_email: req.body.user_email },
                { user_password: 0 }
              )
                .populate("business_category")
                .populate("business_subcategory")
                .exec()
                .then((resp) => {
                  if (
                    user_type != "Business" &&
                    businessdata.user_type == "Business"
                  ) {
                    //newbusinessuser  mail
                    req.body.email = businessdata.user_email;
                    req.body.subject_body = "Verify your business account";
                    req.body.user_name = businessdata.user_name;
                    req.body.type = "newbusinessuser";
                    Notification.send_mail(req, res);
                    console.log("Verify your business account");
                  }
                  resolve(resObj.user_operation_responses("Updated", resp));
                });
            });
          } else {
            resolve(resObj.content_operation_responses("Error", err));
          }
        }
      }
    );
  });
};
// helepr fucntion.
function normalizeBusinessHours(hours) {
  if (!Array.isArray(hours)) return [];
  return hours.map((item) => ({
    ...item,
    from:
      typeof item.from === "object" && item.from !== null
        ? `${item.from.hh}:${item.from.mm} ${item.from.A}`
        : item.from,
    to:
      typeof item.to === "object" && item.to !== null
        ? `${item.to.hh}:${item.to.mm} ${item.to.A}`
        : item.to,
  }));
}

module.exports.update_business_user_byId = function (req, res) {
  let user_type = "";
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne({ _id: req.body._id }, function (err, businessdata) {
      if (err) {
        console.log(err);
        resolve(resObj.content_operation_responses("Error", err));
      } else {
        if (businessdata) {
          if (req.body.business_user_since) {
            businessdata.business_user_since =
              isodate(req.body.business_user_since) ||
              businessdata.business_user_since;
          }
          user_type = businessdata.user_type;
          businessdata.user_type = req.body.user_type || businessdata.user_type;
          businessdata.user_name = req.body.user_name || businessdata.user_name;
          businessdata.user_public_name =
            req.body.user_public_name || businessdata.user_public_name;
          businessdata.user_email =
            req.body.user_email || businessdata.user_email;
          businessdata.user_fcm = req.body.user_fcm || businessdata.user_fcm;
          businessdata.user_gid = req.body.user_gid || businessdata.user_gid;
          businessdata.user_fid = req.body.user_fid || businessdata.user_fid;
          businessdata.user_dp = req.body.user_dp || businessdata.user_dp;
          businessdata.user_phone =
            req.body.user_phone || businessdata.user_phone;
          businessdata.user_fid = req.body.user_fid || businessdata.user_fid;
          businessdata.user_language =
            req.body.user_language || businessdata.user_language;
          businessdata.user_country =
            req.body.user_country || businessdata.user_country;
          businessdata.user_status =
            req.body.user_status || businessdata.user_status;
          // Handle custom URL updates
          if (req.body.custom_url) {
            // Only update if it's changed or doesn't exist
            if (
              !businessdata.custom_url ||
              businessdata.custom_url !== req.body.custom_url
            ) {
              businessdata.custom_url = req.body.custom_url;
            }
          }
          businessdata.business_name_english =
            req.body.business_name_english ||
            businessdata.business_name_english;
          businessdata.business_name_arabic =
            req.body.business_name_arabic || businessdata.business_name_arabic;
          businessdata.business_category =
            req.body.business_category || businessdata.business_category;
          businessdata.business_subcategory =
            req.body.business_subcategory || businessdata.business_subcategory;
          businessdata.business_email =
            req.body.business_email || businessdata.business_email;
          businessdata.business_type =
            req.body.business_type || businessdata.business_type;
          businessdata.business_brand =
            req.body.business_brand || businessdata.business_brand;
          businessdata.business_brand_ar =
            req.body.business_brand_ar || businessdata.business_brand_ar;
          businessdata.business_space =
            req.body.business_space || businessdata.business_space;
          businessdata.business_space_ar =
            req.body.business_space_ar || businessdata.business_space_ar;
          businessdata.business_city =
            req.body.business_city || businessdata.business_city;
          businessdata.business_city_ar =
            req.body.business_city_ar || businessdata.business_city_ar;

          // Parse business_hours with the same logic as create function
          if (req.body.business_hours) {
            try {
              let hoursData = req.body.business_hours;
              while (typeof hoursData === "string") {
                hoursData = JSON.parse(hoursData);
              }
              if (Array.isArray(hoursData)) {
                let parsedBusinessHours = hoursData.filter((day) => {
                  if (!day.from || !day.to) return false;
                  if (day.from === "" || day.to === "") return false;
                  if (
                    typeof day.from === "object" &&
                    (!day.from.hh || !day.from.mm)
                  )
                    return false;
                  if (typeof day.to === "object" && (!day.to.hh || !day.to.mm))
                    return false;
                  return true;
                });
                parsedBusinessHours =
                  normalizeBusinessHours(parsedBusinessHours);
                businessdata.business_hours = parsedBusinessHours;
              } else {
                businessdata.business_hours = [];
              }
            } catch (e) {
              console.error("Error parsing business_hours in update_byId:", e);
              businessdata.business_hours = [];
            }
          }

          // Parse leisure_hours with the same logic as create function
          if (req.body.leisure_hours) {
            try {
              let hoursData = req.body.leisure_hours;
              while (typeof hoursData === "string") {
                hoursData = JSON.parse(hoursData);
              }
              if (Array.isArray(hoursData)) {
                let parsedLeisureHours = hoursData.filter((day) => {
                  if (!day.from || !day.to) return false;
                  if (day.from === "" || day.to === "") return false;
                  if (
                    typeof day.from === "object" &&
                    (!day.from.hh || !day.from.mm)
                  )
                    return false;
                  if (typeof day.to === "object" && (!day.to.hh || !day.to.mm))
                    return false;
                  return true;
                });
                parsedLeisureHours = normalizeBusinessHours(parsedLeisureHours);
                businessdata.leisure_hours = parsedLeisureHours;
              } else {
                businessdata.leisure_hours = [];
              }
            } catch (e) {
              console.error("Error parsing leisure_hours in update_byId:", e);
              businessdata.leisure_hours = [];
            }
          }

          businessdata.location_lat =
            req.body.location_lat || businessdata.location_lat;
          businessdata.location_long =
            req.body.location_long || businessdata.location_long;
          businessdata.address = req.body.address || businessdata.address;
          businessdata.address_ar =
            req.body.address_ar || businessdata.address_ar;
          businessdata.branch_name =
            req.body.branch_name || businessdata.branch_name;
          businessdata.branch_name_ar =
            req.body.branch_name_ar || businessdata.branch_name_ar;

          // Update the main branch's branch_name fields to sync with the main business
          if (businessdata.branches && businessdata.branches.length > 0) {
            const mainBranch = businessdata.branches.find(
              (branch) => branch.is_main
            );
            if (mainBranch) {
              mainBranch.branch_name = businessdata.branch_name;
              mainBranch.branch_name_ar = businessdata.branch_name_ar;
            }
          }

          businessdata.logo = req.body.logo || businessdata.logo;
          businessdata.cover_image =
            req.body.cover_image || businessdata.cover_image;

          cover_image_title_english =
            req.body.cover_image_title_english ||
            businessdata.cover_image_title_english;
          cover_image_title_arabic =
            req.body.cover_image_title_arabic ||
            businessdata.cover_image_title_arabic;
          cover_image_description_english =
            req.body.cover_image_description_english ||
            businessdata.cover_image_description_english;
          cover_image_description_arabic =
            req.body.cover_image_description_arabic ||
            businessdata.cover_image_description_arabic;

          businessdata.deals_in = req.body.deals_in || businessdata.deals_in;
          businessdata.noofquotes =
            req.body.noofquotes || businessdata.noofquotes;

          businessdata.max_hashtags =
            req.body.max_hashtags || businessdata.max_hashtags;
          businessdata.business_description_english =
            req.body.business_description_english ||
            businessdata.business_description_english;
          businessdata.business_description_arabic =
            req.body.business_description_arabic ||
            businessdata.business_description_arabic;
          businessdata.web_link = req.body.web_link || businessdata.web_link;
          businessdata.fb_link = req.body.fb_link || businessdata.fb_link;
          businessdata.instagram_link =
            req.body.instagram_link || businessdata.instagram_link;
          businessdata.youtube_link =
            req.body.youtube_link || businessdata.youtube_link;
          businessdata.twitter_link =
            req.body.twitter_link || businessdata.twitter_link;
          businessdata.ratings = req.body.ratings || businessdata.ratings;
          businessdata.business_featured =
            req.body.business_featured || businessdata.business_featured;
          businessdata.save({ new: true }).then((result) => {
            BusinessUser.findOne({ _id: req.body._id }, { user_password: 0 })
              .populate("business_category")
              .populate("business_subcategory")
              .exec()
              .then((resp) => {
                if (
                  user_type != "Business" &&
                  businessdata.user_type == "Business"
                ) {
                  //newbusinessuser  mail
                  req.body.email = businessdata.user_email;
                  req.body.subject_body = "Verify your business account";
                  req.body.user_name = businessdata.user_name;
                  req.body.type = "newbusinessuser";
                  Notification.send_mail(req, res);
                  console.log("Verify your business account");
                }
                resolve(resObj.user_operation_responses("Updated", resp));
              });
          });
        } else {
          resolve(resObj.content_operation_responses("Error", err));
        }
      }
    });
  });
};

module.exports.get_business_categories_andSubcategories = async function (
  req,
  res
) {
  try {
    const categories = await BusinessCat.find();
    const subcategories = await BusinessSubCat.find().populate(
      "business_category_oid"
    );
    const hashmap = [];

    categories.forEach((category) => {
      const categoryName = category.business_category_name;
      if (!categoryName) return;

      let containSubs = false;

      subcategories.forEach((subcategory) => {
        const subcategoryCategoryName =
          subcategory.business_category_oid.business_category_name;
        const subcategoryName = subcategory.business_subcategory_name;

        if (categoryName === subcategoryCategoryName && subcategoryName) {
          containSubs = true;

          const existingCategory = hashmap.find(
            (item) =>
              item.category.business_category_name === subcategoryCategoryName
          );

          if (existingCategory) {
            existingCategory.subcategories.push(subcategory);
          } else {
            hashmap.push({
              category: category,
              subcategories: [subcategory],
            });
          }
        }
      });

      if (!containSubs) {
        // Add code here if you want to handle categories without subcategories
        // e.g., hashmap.push({ category: category, subcategories: ["General"] });
      }
    });

    // THIS IS SO WRONG - REFREACTOR ASAP DB MODELS
    // Adding one more category + subcatories to the hashmap from iventory_subcateogores
    // This will be used only to selected the sub-cate of a Design category type
    // const designSubactegories = await InventorySubCat.filter({inventory_category_name: "Designs"});
    // const _d = {_id: designSubactegories[0]._id, }

    return resObj.content_operation_responses("Fetch", hashmap);
  } catch (error) {
    throw new Error(
      "Error fetching categories and subcategories: " + error.message
    );
  }
  // return new Promise(async function (resolve, reject) {
  // 	// console.log("Get all category hashmap");
  // 	let categories = await BusinessCat.find();
  // 	let subcategories = await BusinessSubCat.find().populate(
  // 		"business_category_oid"
  // 	);
  // 	let hashmap = [];
  // 	categories.map((category) => {
  // 		const category_name = category.business_category_name;
  // 		if (category_name) {
  // 			let containSubs = false;
  // 			for (var i = 0; i < subcategories.length; i++) {
  // 				const subcategory_category_name =subcategories[i].business_category_oid.business_category_name;
  // 				const subcategory =subcategories[i].business_subcategory_name;
  // 				if (
  // 					category_name === subcategory_category_name &&
  // 					subcategory
  // 				) {
  // 					containSubs = true;
  // 					// if(hashmap[category_name]){
  // 					let categoryExists = hashmap.filter(
  // 						(item) =>
  // 							item.category.business_category_name ===
  // 							subcategory_category_name
  // 					)[0];
  // 					// console.log(categoryExists);
  // 					if (categoryExists) {
  // 						// hashmap[category_name].push(subcategory);
  // 						for (var j = 0; j < hashmap.length; j++) {
  // 							if (
  // 								hashmap[j].category
  // 									.business_category_name ===
  // 								subcategory_category_name
  // 							) {
  // 								hashmap[j].subcategories.push(
  // 									subcategories[i]
  // 								);
  // 							}
  // 						}
  // 					} else {
  // 						// hashmap[category_name] = [subcategory];
  // 						hashmap.push({
  // 							category: category,
  // 							subcategories: [subcategories[i]],
  // 						});
  // 					}
  // 				}
  // 			}
  // 			if (!containSubs) {
  // 				// hashmap.push({category:category, subcategories:["General"]})
  // 				// hashmap[category_name] = ["General"]
  // 			}
  // 		}
  // 	});
  // 	// console.log(hashmap);
  // 	resolve(resObj.content_operation_responses("Fetch", hashmap));
  // });
};

module.exports.update_business_public = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne(
      { user_id: req.body.business_id },
      function (err, businessdata) {
        if (err) {
          reject("Invalid");
        } else {
          ratings = req.body.user_review.rating;
          if (businessdata.ratings === 0) {
            businessdata.ratings = parseFloat(ratings);
            let index = businessdata.user_reviews.findIndex(
              (x) => x.comment_by === req.body.user_review.comment_by
            );
            if (index === -1) {
              businessdata.user_reviews.push(req.body.user_review);
            } else {
              businessdata.user_reviews.splice(
                businessdata.user_reviews.findIndex(
                  (item) => item.comment_by === req.body.user_review.comment_by
                ),
                1
              );
              businessdata.user_reviews.push(req.body.user_review);
              //console.log("Checked");
            }
          } else {
            businessdata.ratings =
              (businessdata.ratings + parseFloat(ratings)) / 2;
            let index = businessdata.user_reviews.findIndex(
              (x) => x.comment_by == req.body.user_review.comment_by
            );
            if (index === -1) {
              businessdata.user_reviews.push(req.body.user_review);
            } else {
              businessdata.user_reviews.splice(
                businessdata.user_reviews.findIndex(
                  (item) => item.comment_by === req.body.user_review.comment_by
                ),
                1
              );
              businessdata.user_reviews.push(req.body.user_review);
            }
          }
          businessdata.save({ new: true }).then((result) => {
            BusinessUser.findOne({ user_id: req.body.business_id })
              .populate("business_category")
              .populate("business_subcategory")
              .exec()
              .then((resp) => {
                resolve(resObj.content_operation_responses("Updated", resp));
              });
          });
        }
      }
    );
  });
};

module.exports.read_business_reviews = function (userId) {
  return new Promise((resolve, reject) => {
    BusinessUser.findOne({ user_id: userId })
      .populate("user_reviews.comment_by", { user_password: 0 })
      // .limit(ConstantCtrl.limit)
      .then((resp) => {
        // console.log(userId);
        if (resp.user_reviews) {
          resolve(
            resObj.content_operation_responses("Fetch", resp.user_reviews)
          );
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      });
  });
};

module.exports.read_following_feed = function (followingIds) {
  return new Promise(function (resolve, reject) {
    if (!followingIds || followingIds.length === 0) {
      resolve([]);
      return;
    }

    // First get the user documents using string IDs
    BusinessUser.find({ user_id: { $in: followingIds } })
      .select("_id")
      .then((users) => {
        const objectIds = users.map((user) => user._id);

        if (objectIds.length === 0) {
          resolve([]);
          return;
        }

        return Promise.all([
          BusinessUser.find(
            { _id: { $in: objectIds }, user_status: "approved" },
            { user_password: 0 }
          )
            .populate("business_category")
            .populate("business_subcategory")
            .sort({ updated_at: -1 })
            .limit(20),

          Inventory.find({
            created_by_user: { $in: objectIds },
            item_status: "approved",
          })
            .populate("item_category")
            .populate("item_subcategory")
            .populate("created_by_user")
            .sort({ updated_at: -1 })
            .limit(20),

          Project.find({
            created_by_user: { $in: objectIds },
            project_status: "approved",
          })
            .populate("created_by_user")
            .sort({ updated_at: -1 })
            .limit(20),

          Blog.find({
            created_by_user: { $in: objectIds },
            blog_status: "approved",
          })
            .populate("created_by_user")
            .sort({ updated_at: -1 })
            .limit(20),
        ]).then((results) => {
          const [businesses, inventories, projects, blogs] = results;
          let feedItems = [];

          // Add business updates
          businesses.forEach((business) => {
            feedItems.push({
              type: "business_update",
              id: business._id,
              user_id: business.user_id,
              user_name: business.user_public_name,
              user_dp: business.user_dp,
              business_name: business.business_name_english,
              business_logo: business.logo,
              business_cover: business.cover_image,
              content: business.business_description_english,
              images: [business.logo, business.cover_image].filter(Boolean),
              timestamp: business.updated_at,
              activity_type: "business_profile_update",
            });
          });

          // Add inventory items
          inventories.forEach((item) => {
            feedItems.push({
              type: "inventory_post",
              id: item._id,
              user_id: item.created_by_user?._id,
              user_name: item.created_by_user?.user_public_name,
              user_dp: item.created_by_user?.user_dp,
              title: item.item_name,
              content: item.item_description,
              images: item.item_images || [],
              price: item.item_price,
              timestamp: item.updated_at,
              activity_type: "new_inventory_item",
            });
          });

          // Add projects
          projects.forEach((project) => {
            feedItems.push({
              type: "project_post",
              id: project._id,
              user_id: project.created_by_user?._id,
              user_name: project.created_by_user?.user_public_name,
              user_dp: project.created_by_user?.user_dp,
              title: project.project_name,
              content: project.project_description,
              images: project.project_images || [],
              timestamp: project.updated_at,
              activity_type: "new_project",
            });
          });

          // Add blog posts
          blogs.forEach((blog) => {
            feedItems.push({
              type: "blog_post",
              id: blog._id,
              user_id: blog.created_by_user?._id,
              user_name: blog.created_by_user?.user_public_name,
              user_dp: blog.created_by_user?.user_dp,
              title: blog.blog_title,
              content: blog.blog_content,
              images: blog.blog_images || [],
              timestamp: blog.updated_at,
              activity_type: "new_blog_post",
            });
          });

          // Sort by timestamp and limit results
          feedItems.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          feedItems = feedItems.slice(0, 50);

          resolve(feedItems);
        });
      })
      .catch((error) => {
        console.error("Error fetching following feed:", error);
        resolve([]);
      });
  });
};

module.exports.deletecomment = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne(
      { user_id: req.body.business_id },
      function (err, businessdata) {
        if (err) {
          reject("Invalid");
        } else {
          ratings = req.body.user_review.rating;
          if (businessdata.ratings === 0) {
            businessdata.ratings = parseFloat(ratings);
            let index = businessdata.user_reviews.findIndex(
              (x) => x.comment_by === req.body.user_review.comment_by
            );
            if (index === -1) {
              //businessdata.user_reviews.push(req.body.user_review);
            } else {
              businessdata.user_reviews.splice(
                businessdata.user_reviews.findIndex(
                  (item) => item.comment_by === req.body.user_review.comment_by
                ),
                1
              );
              //businessdata.user_reviews.push(req.body.user_review);
              //console.log("Checked");
            }
          } else {
            businessdata.ratings =
              (businessdata.ratings - parseFloat(ratings)) / 2;
            let index = businessdata.user_reviews.findIndex(
              (x) => x.comment_by == req.body.user_review.comment_by
            );
            if (index === -1) {
              //businessdata.user_reviews.push(req.body.user_review);
            } else {
              businessdata.user_reviews.splice(
                businessdata.user_reviews.findIndex(
                  (item) => item.comment_by === req.body.user_review.comment_by
                ),
                1
              );
              //businessdata.user_reviews.push(req.body.user_review);
            }
          }
          businessdata.save({ new: true }).then((result) => {
            BusinessUser.findOne({ user_id: req.body.business_id })
              .populate("business_category")
              .populate("business_subcategory")
              .exec()
              .then((resp) => {
                resolve(resObj.content_operation_responses("Updated", resp));
              });
          });
        }
      }
    );
  });
};

update_user_likes = function (optype, user_id, item_id) {
  return new Promise(function (resolve, reject) {
    //item_oid = ObjectId(item_oid);

    if (optype === "Add") {
      BusinessUser.findOneAndUpdate(
        { user_id: user_id },
        { $addToSet: { user_likes: item_id } },
        { new: true }
      )
        .populate("business_category")
        .populate("business_subcategory")
        .exec()
        .then((resp_data) => {
          resolve(resp_data);
        })
        .catch((error) => {
          console.log(error);
          console.log(
            "-----------------------------Not updated in user data------------------------------"
          );
        });
    } else if (optype === "Remove") {
      BusinessUser.findOneAndUpdate(
        { user_id: user_id },
        { $pull: { user_likes: item_id } },
        { new: true }
      )
        .populate("business_category")
        .populate("business_subcategory")
        .exec()
        .then((resp_data) => {
          resolve(resp_data);
        })
        .catch((error) => {
          console.log();
          console.log(
            "-----------------------------Not updated in user data------------------------------"
          );
        });
    } else {
    }
  });
};

module.exports.delete_business_user = function (user_email) {
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne({ user_email: user_email })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(resObj.user_operation_responses("DeleteUserError", result));
        } else {
          resolve(resObj.user_operation_responses("DeleteUser", result));
        }
      })
      .catch((error) => {
        console.log(error);
        if (!data)
          resolve(resObj.user_operation_responses("Error", "User not found"));
      });
  });
};

module.exports.forgotpassword = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne({ user_email: req.body.user_email })
      .populate("business_category")
      .populate("business_subcategory")
      .sort({ updated_at: -1 })
      .exec()
      .then((resp) => {
        if (resp) {
          console.log("req", req.body);
          console.log(resp);

          // Use the password reset handler to generate a token
          const passwordResetHandler = require("./password-reset-handler");

          // Generate token with 60 minute expiry
          passwordResetHandler
            .createResetToken(resp.user_email, 60)
            .then((resetData) => {
              // Set up email request
              req.body.email = resp.user_email;
              req.body.user_name =
                resp.user_name || resp.user_public_name || "nabnee User";
              req.body.reset_token = resetData.resetToken;
              req.body._id = resp._id;

              req.body.type = "password_reset";

              if (req.body.user_lang == "arabic") {
                req.body.subject_body = "إعادة تعيين كلمة المرور - نبني";
                req.body.language = "ar";
              } else {
                req.body.subject_body = "Reset your nabnee password";
                req.body.language = "en";
              }

              // Send password reset email
              Notification.send_mail(req, res);
            });

          resolve(
            resObj.user_operation_responses(
              "Updated",
              "Password reset email sent"
            )
          );
        } else {
          resolve(
            resObj.content_operation_responses(
              "Unavailable",
              "User not found with this email"
            )
          );
        }
      })
      .catch((error) => {
        console.error("Error in forgot password:", error);
        resolve("Try again");
      });
  });
};

module.exports.changepassword = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessUser.findOne(
      { _id: req.body.id, user_status: "approved" },
      function (err, userdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (userdata) {
            const saltRounds = 10;
            bcrypt
              .hash(req.body.user_password, saltRounds)
              .then((hash) => {
                return hash;
              })
              .then((password) => {
                userdata.user_password = password || userdata.user_password;
                userdata
                  .save({ new: true })
                  .then((result) => {
                    BusinessUser.find({ _id: req.body.id })
                      .populate("business_category")
                      .populate("business_subcategory")
                      .sort({ updated_at: -1 })
                      .exec()
                      .then((resp) => {
                        resolve(
                          resObj.user_operation_responses(
                            "Updatedwithtoken",
                            resp
                          )
                        );
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    resolve(resObj.content_operation_responses("Error", error));
                  });
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    ).catch((error) => {
      resolve("Try again");
    });
  });
};

//*****************************************Collections****************************************************************

module.exports.search_collection = function (collection_name) {
  return new Promise(function (resolve, reject) {
    Collection.find({
      collection_name: collection_name,
      status: "approved",
    })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_collection_by_user = function (created_by, status) {
  return new Promise(function (resolve, reject) {
    user_oid = ObjectId(created_by);
    Collection.find({ created_by: user_oid, status: status })
      .populate("created_by")
      .populate("collection_items")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_collection_by_collection_id = function (collection_id) {
  return new Promise(function (resolve, reject) {
    Collection.find({ collection_id: collection_id })
      .populate("created_by")
      .populate("collection_items")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.create_collection = function (req, res) {
  return new Promise(function (resolve, reject) {
    let ColID = uniqid();
    // let user_oid = req.body.created_by;
    Collection.create({
      collection_id: ColID,
      collection_name: req.body.collection_name,
      collection_description: req.body.collection_description,
      collection_type: req.body.collection_type,
      collection_img: req.body.collection_img,
      collection_theme_color: req.body.collection_theme_color,
      created_by: req.body.created_by,
    })
      .then((Content) => {
        resolve(resObj.content_operation_responses("Created", Content));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_collection = function (req, res) {
  return new Promise(function (resolve, reject) {
    user_oid = ObjectId(req.body.created_by);
    Collection.findOne(
      { collection_id: req.body.collection_id, created_by: user_oid },
      function (err, data) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (data) {
            data.collection_name =
              req.body.collection_name || data.collection_name;
            data.collection_description =
              req.body.collection_description || data.collection_description;
            data.created_by = req.body.created_by || data.created_by;
            data.collection_theme_color =
              req.body.collection_theme_color || data.collection_theme_color;
            data.collection_img =
              req.body.collection_img || data.collection_img;
            data.collection_type =
              req.body.collection_type || data.collection_type;
            data.status = req.body.status || data.status;
            data
              .save({ new: true })
              .then((result) => {
                if (req.body.items && req.body.optype) {
                  this.update_collection_item(
                    req.body.optype,
                    req.body.items,
                    req.body.collection_id
                  ).then((resp) => {
                    resolve(
                      resObj.content_operation_responses("Updated", resp)
                    );
                  });
                } else {
                  Collection.find({
                    collection_id: req.body.collection_id,
                  })
                    .populate("collection_items")
                    .exec()
                    .then((resp) => {
                      console.log(resp);
                      if (resp.length > 0) {
                        resolve(
                          resObj.content_operation_responses("Updated", resp)
                        );
                      } else {
                        resolve(
                          resObj.content_operation_responses(
                            "Unavailable",
                            "NA"
                          )
                        );
                      }
                    })
                    .catch((error) => {
                      resolve(
                        resObj.content_operation_responses("Error", error)
                      );
                    });
                }
              })
              .catch((error) => {
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

update_collection_item = function (optype, items, collection_id) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      items = items.split(",");
      Collection.findOneAndUpdate(
        { collection_id: collection_id },
        { $addToSet: { collection_items: { $each: items } } },
        { new: true }
      )
        .populate("collection_items")
        .exec()
        .then((resp_data) => {
          resolve(resp_data);
        });
    } else if (optype === "Remove") {
      Collection.findOneAndUpdate(
        { collection_id: collection_id },
        { $pull: { collection_items: items } },
        { new: true }
      )
        .populate("collection_items")
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        });
    } else {
    }
  });
};

module.exports.delete_collection = function (collection_id, created_by) {
  return new Promise(function (resolve, reject) {
    user_oid = ObjectId(created_by);
    Collection.findOne({
      collection_id: collection_id,
      created_by: user_oid,
    })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//*****************************************Projects****************************************************************

module.exports.search_project = function (
  project_name,
  project_name_ar,
  created_by
) {
  return new Promise(function (resolve, reject) {
    let detail = {};
    console.log("createdBy: ", created_by);
    //Project.find({ $or : [ {"project_name" : project_name}, {"project_name_ar" : project_name_ar} ] })
    //Project.find({$or : [{ project_name: project_name }, { project_name_ar: project_name_ar }]})
    if (project_name_ar) {
      // detail = {$or:[{project_name: project_name},{project_name_ar:project_name_ar}]};
      detail = {
        $and: [
          {
            $or: [
              { project_name: project_name },
              { project_name_ar: project_name_ar },
            ],
          },
          { created_by: created_by },
        ],
      };
    } else {
      detail = { project_name: project_name, created_by: created_by };
    }
    Project.findOne(detail)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp) {
          resolve("Exists");
        } else {
          resolve("Allowed");
        }
      })
      .catch((error) => {
        console.log(error);
        resolve("Try again");
      });
  });
};

module.exports.read_project_by_user = function (createdBy, status) {
  return new Promise(function (resolve, reject) {
    // console.log("created_by: ", createdBy);
    let user_oid = ObjectId(createdBy);
    Project.find({ created_by: user_oid, status: "approved" })
      .populate("project_items")
      .populate("created_by", { user_password: 0 })
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_project = function (req, res) {
  return new Promise(function (resolve, reject) {
    let ProjectID = uniqid();
    // let user_oid = req.body.created_by;
    Project.create({
      project_id: ProjectID,
      project_name: req.body.project_name,
      project_name_ar: req.body.project_name_ar,
      project_description: req.body.project_description,
      project_description_ar: req.body.project_description_ar,
      project_type: req.body.project_type,
      project_img: req.body.project_img,
      project_theme_color: req.body.project_theme_color,
      created_by: ObjectId(req.body.created_by),
    })
      .then((Content) => {
        resolve(resObj.content_operation_responses("Created", Content));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_project = function (req, res) {
  return new Promise(function (resolve, reject) {
    user_oid = ObjectId(req.body.created_by);
    console.log(req.body);
    Project.findOne(
      { project_id: req.body.project_id, created_by: user_oid },
      function (err, data) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (data) {
            data.project_name = req.body.project_name || data.project_name;
            data.project_name_ar =
              req.body.project_name_ar || data.project_name_ar;
            data.project_description =
              req.body.project_description || data.project_description;
            data.project_description_ar =
              req.body.project_description_ar || data.project_description_ar;
            data.created_by = req.body.created_by || data.created_by;
            data.project_theme_color =
              req.body.project_theme_color || data.project_theme_color;
            data.project_img = req.body.project_img || data.project_img;
            data.project_type = req.body.project_type || data.project_type;
            data.status = req.body.status || data.status;
            data
              .save({ new: true })
              .then((result) => {
                if (req.body.items && req.body.optype) {
                  this.update_project_item(
                    req.body.optype,
                    req.body.items,
                    req.body.project_id
                  ).then((resp) => {
                    resolve(
                      resObj.content_operation_responses("Updated", resp)
                    );
                  });
                } else {
                  Project.findOne({
                    project_id: req.body.project_id,
                  })
                    .populate("project_items")
                    .populate("created_by")
                    .exec()
                    .then((resp) => {
                      resolve(
                        resObj.content_operation_responses("Updated", resp)
                      );
                    });
                }
              })
              .catch((error) => {
                //console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.move_listing_to_project = function (
  listingID,
  oldProjectID,
  newProjectID
) {
  return new Promise(async function (resolve, reject) {
    await update_project_item("Add", listingID, newProjectID);
    // console.log("updated new document");
    if (!oldProjectID) {
      resolve(resObj.content_operation_responses("Updated"));
    } else {
      update_project_item("Remove", listingID, oldProjectID).then((data) => {
        // console.log("updated old document");
        resolve(resObj.content_operation_responses("Updated", data.details));
      });
    }

    // updated old project
    // let data = await Project.findOne({ project_id: oldProjectID });
    // let updatedOldItems = data.project_items.filter(
    // 	(id) => id != listingID
    // );
    // await Project.updateOne(
    // 	{ project_id: oldProjectID },
    // 	{ project_items: updatedOldItems }
    // );
    // console.log(`old listings : ${data.project_items}`);
    // console.log(
    // 	`projects ID:${oldProjectID} : save listings : ${updatedOldItems}`
    // );

    // // updating new project
    // let data2 = await Project.findOne({ project_id: newProjectID });
    // let updatedNewItems = [...data2.project_items, listingID];
    // await Project.updateOne(
    // 	{ project_id: oldProjectID },
    // 	{ project_items: updatedNewItems }
    // );
    // console.log(`new listings : ${data2.project_items}`);
    // console.log(
    // 	`projects ID:${newProjectID} : save listings : ${updatedNewItems}`
    // );
  });
};

module.exports.add_listing_to_project = function (listingID, projectID) {
  return new Promise(async function (resolve, reject) {
    resolve(update_project_item("Add", listingID, projectID));
  });
};
module.exports.remove_listing_from_project = function (listingID, projectID) {
  return new Promise(async function (resolve, reject) {
    resolve(update_project_item("Remove", listingID, projectID));
  });
};

update_project_item = function (optype, items, project_id) {
  console.log(optype, items, project_id);
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      items = items.split(",");
      Project.findOneAndUpdate(
        { project_id: project_id },
        { $addToSet: { project_items: { $each: items } } },
        { new: true }
      )
        .populate("project_items")
        .exec()
        .then((resp_data) => {
          resolve(resp_data);
        });
    } else if (optype === "Remove") {
      Project.findOneAndUpdate(
        { project_id: project_id },
        { $pull: { project_items: items } },
        { new: true }
      )
        .populate("project_items")
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        });
    } else {
    }
  });
};

module.exports.delete_project = function (project_id, created_by) {
  return new Promise(function (resolve, reject) {
    user_oid = ObjectId(created_by);
    Project.findOne({ project_id: project_id, created_by: user_oid })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_project_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    Project.find(req.body.details)
      .populate("project_items")
      .populate("created_by")
      .sort({ updated_at: -1 })
      .skip(parseInt(req.body.offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_project_by_id = function (project_id) {
  return new Promise(function (resolve, reject) {
    Project.find({ project_id: project_id })
      .populate("project_items")
      .populate("created_by", { user_password: 0 })
      .populate({ path: "project_items", populate: "created_by" })
      .sort({ updated_at: -1 })
      // .skip(parseInt(req.body.offset) * ConstantCtrl.limit)
      // .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          // console.log(resp[0].project_items);
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

////////////////Inventory Category Handlers//////////////////////////////////////////////////////////////////////

module.exports.create_inventory_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    let inventoryCatID = uniqid();
    InventoryCat.create({
      inventory_category_id: inventoryCatID,
      inventory_category_name: req.body.inventory_category_name,
      inventory_category_name_ar: req.body.inventory_category_name_ar,
      inventory_category_type: req.body.inventory_category_type,
      inventory_category_icon: req.body.inventory_category_icon,
      inventory_category_img: req.body.inventory_category_img,
      inventory_category_theme_color: req.body.inventory_category_theme_color,
      created_by: req.body.created_by,
    })
      .then((inventoryContent) => {
        resolve(
          resObj.content_operation_responses("Created", inventoryContent)
        );
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.search_inventory_category = function (
  inventory_category_name,
  inventory_category_name_ar
) {
  return new Promise(function (resolve, reject) {
    let detail = {};
    if (inventory_category_name_ar) {
      detail = {
        $or: [
          { inventory_category_name: inventory_category_name },
          { inventory_category_name_ar: inventory_category_name_ar },
        ],
      };
    } else {
      detail = { inventory_category_name: inventory_category_name };
    }

    InventoryCat.findOne(detail)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp) {
          resolve("Exists");
        } else {
          resolve("Allowed");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.search_inventory_category_public = function (
  inventory_category_name,
  inventory_category_name_ar
) {
  return new Promise(function (resolve, reject) {
    InventoryCat.find({ status: "approved" })
      .or([
        {
          inventory_category_name: {
            $regex: inventory_category_name,
            $options: "i",
          },
        },
        {
          inventory_category_name_ar: {
            $regex: inventory_category_name,
            $options: "i",
          },
        },
      ])
      .exec()
      .then((resp) => {
        //console.log(resp.length);
        if (resp.length === 0) {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        } else {
          resolve(resObj.content_operation_responses("Fetch", resp));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_category_approved = function () {
  return new Promise(function (resolve, reject) {
    InventoryCat.find({ status: "approved" })
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_category_disapproved = function () {
  return new Promise(function (resolve, reject) {
    InventoryCat.find({ status: "disapproved" })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_category_all = function () {
  return new Promise(function (resolve, reject) {
    InventoryCat.find()
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_category_admin = function (req, res) {
  return new Promise(function (resolve, reject) {
    InventoryCat.find(req.body.details)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_inventory_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    InventoryCat.findOne(
      {
        inventory_category_id: req.body.inventory_category_id,
        created_by: req.body.created_by,
      },
      function (err, inventorydata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (inventorydata) {
            inventorydata.inventory_category_name =
              req.body.inventory_category_name ||
              inventorydata.inventory_category_name;
            inventorydata.inventory_category_name_ar =
              req.body.inventory_category_name_ar ||
              inventorydata.inventory_category_name_ar;
            inventorydata.created_by =
              req.body.created_by || inventorydata.created_by;
            inventorydata.inventory_category_theme_color =
              req.body.inventory_category_theme_color ||
              inventorydata.inventory_category_theme_color;
            inventorydata.inventory_category_img =
              req.body.inventory_category_img ||
              inventorydata.inventory_category_img;
            inventorydata.inventory_category_icon =
              req.body.inventory_category_icon ||
              inventorydata.inventory_category_icon;
            inventorydata.inventory_category_type =
              req.body.inventory_category_type ||
              inventorydata.inventory_category_type;
            inventorydata.status = req.body.status || inventorydata.status;
            inventorydata
              .save({ new: true })
              .then((result) => {
                resolve(resObj.content_operation_responses("Updated", result));
              })
              .catch((error) => {
                //console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_inventory_category = function (
  inventory_category_id,
  created_by
) {
  return new Promise(function (resolve, reject) {
    InventoryCat.findOne({
      inventory_category_id: inventory_category_id,
      created_by: created_by,
    })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//////////////////Inventory Subcategory Handlers///////////////////////////////////////////////////////////////////////////////

module.exports.create_inventory_subcategory = function (req, res) {
  return new Promise(function (resolve, reject) {
    let inventorySubCatID = uniqid();
    InventorySubCat.create({
      inventory_subcategory_id: inventorySubCatID,
      inventory_category_name: req.body.inventory_category_name,
      inventory_category_name_ar: req.body.inventory_category_name_ar,
      inventory_category_oid: req.body.inventory_category_oid,
      inventory_subcategory_name: req.body.inventory_subcategory_name,
      inventory_subcategory_name_ar: req.body.inventory_subcategory_name_ar,
      inventory_subcategory_type: req.body.inventory_subcategory_type,
      inventory_subcategory_img: req.body.inventory_subcategory_img,
      inventory_subcategory_icon: req.body.inventory_subcategory_icon,
      inventory_subcategory_theme_color:
        req.body.inventory_subcategory_theme_color,
      created_by: req.body.created_by,
    })
      .then((inventoryContent) => {
        resolve(
          resObj.content_operation_responses("Created", inventoryContent)
        );
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.search_inventory_subcategory = function (
  inventory_subcategory_name,
  inventory_subcategory_name_ar,
  inventory_category_oid
) {
  return new Promise(function (resolve, reject) {
    let detail = {};
    let category_oid = ObjectId(inventory_category_oid);
    if (inventory_subcategory_name_ar) {
      detail = {
        $or: [
          { inventory_subcategory_name: inventory_subcategory_name },
          {
            inventory_subcategory_name_ar: inventory_subcategory_name_ar,
          },
        ],
      };
    } else {
      detail = { inventory_subcategory_name: inventory_subcategory_name };
    }

    InventorySubCat.findOne(detail)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp) {
          resolve("Exists");
        } else {
          resolve("Allowed");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.search_inventory_subcategory_public = function (
  inventory_subcategory_name
) {
  return new Promise(function (resolve, reject) {
    InventorySubCat.find({ status: "approved" })
      .or([
        {
          inventory_subcategory_name: {
            $regex: inventory_subcategory_name,
            $options: "i",
          },
        },
        {
          inventory_subcategory_name_ar: {
            $regex: inventory_subcategory_name,
            $options: "i",
          },
        },
      ])
      .populate("inventory_category_oid")
      .exec()
      .then((resp) => {
        //console.log(resp.length);
        if (resp.length === 0) {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        } else {
          resolve(resObj.content_operation_responses("Fetch", resp));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_subcategory_approved = function () {
  return new Promise(function (resolve, reject) {
    InventorySubCat.find({ status: "approved" })
      .populate("inventory_category_oid")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_subcategory_disapproved = function () {
  return new Promise(function (resolve, reject) {
    InventorySubCat.find({ status: "disapproved" })
      .populate("inventory_category_oid")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_subcategory_all = function () {
  return new Promise(function (resolve, reject) {
    InventorySubCat.find()
      .populate("inventory_category_oid")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_subcategory_admin = function (req, res) {
  return new Promise(function (resolve, reject) {
    InventorySubCat.find(req.body.details)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_subcategory_by_category = function (
  category_oid
) {
  return new Promise(function (resolve, reject) {
    category_oid = ObjectId(category_oid);
    InventorySubCat.find({
      status: "approved",
      inventory_category_oid: category_oid,
    })
      .populate("inventory_category_oid")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_inventory_subcategory = function (req, res) {
  return new Promise(function (resolve, reject) {
    InventorySubCat.findOne(
      {
        inventory_subcategory_id: req.body.inventory_subcategory_id,
        created_by: req.body.created_by,
      },
      function (err, inventorydata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (inventorydata) {
            inventorydata.inventory_subcategory_name =
              req.body.inventory_subcategory_name ||
              inventorydata.inventory_subcategory_name;
            inventorydata.inventory_subcategory_name_ar =
              req.body.inventory_subcategory_name_ar ||
              inventorydata.inventory_subcategory_name_ar;
            inventorydata.inventory_subcategory_theme_color =
              req.body.inventory_subcategory_theme_color ||
              inventorydata.inventory_subcategory_theme_color;
            inventorydata.inventory_subcategory_img =
              req.body.inventory_subcategory_img ||
              inventorydata.inventory_subcategory_img;
            inventorydata.inventory_subcategory_icon =
              req.body.inventory_subcategory_icon ||
              inventorydata.inventory_subcategory_icon;
            inventorydata.inventory_subcategory_type =
              req.body.inventory_subcategory_type ||
              inventorydata.inventory_subcategory_type;
            inventorydata.inventory_category_name =
              req.body.inventory_category_name ||
              inventorydata.inventory_category_name;
            inventorydata.inventory_category_name_ar =
              req.body.inventory_category_name_ar ||
              inventorydata.inventory_category_name_ar;
            inventorydata.inventory_category_oid =
              ObjectId(req.body.inventory_category_oid) ||
              inventorydata.inventory_category_oid;
            inventorydata.status = req.body.status || inventorydata.status;
            inventorydata
              .save({ new: true })
              .then((result) => {
                resolve(resObj.content_operation_responses("Updated", result));
              })
              .catch((error) => {
                //console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_inventory_subcategory = function (
  inventory_subcategory_id,
  created_by
) {
  return new Promise(function (resolve, reject) {
    InventorySubCat.findOne({
      inventory_subcategory_id: inventory_subcategory_id,
      created_by: created_by,
    })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//*****************************************Inventory****************************************************************

module.exports.search_inventory = function (
  item_name,
  item_name_ar,
  created_by,
  status
) {
  return new Promise(function (resolve, reject) {
    let detail = {};
    if (item_name_ar) {
      detail = {
        $or: [{ item_name: item_name }, { item_name_ar: item_name_ar }],
      };
    } else {
      detail = { item_name: item_name };
    }
    if (created_by) {
      detail.created_by = created_by;
    }

    if (status) {
      detail.status = status;
    }

    Inventory.findOne(detail)
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp) {
          resolve("Exists");
        } else {
          resolve("Allowed");
        }
      })
      .catch((error) => {
        console.log(error);
        resolve("Try again");
      });
  });
};

module.exports.search_inventory_related = function (categoryId, subCategoryId) {
  return new Promise((resolve, reject) => {
    // Inventory.find({ item_subcategory: ObjectId(subCategoryId) })
    // 	.populate("created_by")
    // 	.populate("item_category")
    // 	.populate("item_subcategory")
    // 	.then((res) => {
    // 		Inventory.find({ item_category: ObjectId(categoryId) })
    // 			.populate("created_by")
    // 			.populate("item_category")
    // 			.populate("item_subcategory")
    // 			.then((res1) => {
    // 				console.log(res);
    // 				console.log(res1);
    // 				resolve([...res, ...res1]);
    // 			});
    // 	});
    Inventory.find({
      item_subcategory: ObjectId(subCategoryId),
      item_category: ObjectId(categoryId),
    })
      .populate("created_by", { user_password: 0 })
      .populate("item_category")
      .populate("item_subcategory")
      .then((res) => {
        resolve(res);
      });
  });
};

module.exports.read_inventory_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    // console.log(req.body);

    if (req.body.search_term) {
      let date = new Date();
      date = date.toISOString().slice(0, 10);
      //date=date.toString().split("T");
      Search.findOneAndUpdate(
        {
          search_term: req.body.search_term,
          search_type: req.body.search_type,
          updated_at: date,
        },
        { $inc: { search_count: 1 } },
        { upsert: true }
      )
        .exec()
        .then((response) => {
          if (response) {
            console.log("Search term added/updated");
          }
        });
    }

    let detailValue = req.body.details;
    let details = {};

    if (req.body.item_name) {
      //details = {$or : [{item_name: { $regex: req.body.item_name, $options: 'i' }}, {item_tags : {$in : []}}], ...detailValue};
      //details = {$or : [{item_name: { $regex: req.body.item_name, $options: 'i' }}, {item_tags : {$regex : req.body.item_name, $options : 'i'}}, {item_description : {$regex : req.body.item_name, $options : 'i'}}, {item_name_ar : {$regex : req.body.item_name, $options : 'i'}}, {item_description_ar : {$regex : req.body.item_name, $options : 'i'}}], ...detailValue};
      details = {
        $and: [
          {
            $or: [
              {
                item_name: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_tags: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_description: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_name_ar: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_description_ar: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
            ],
          },
          detailValue,
        ],
      };
    } else if (req.body.item_name_ar) {
      //details = {$or : [{item_name_ar: { $regex: req.body.item_name_ar, $options: 'i' }}, {item_tags : {$regex : req.body.item_name_ar, $options : 'i'}}, {item_description_ar : {$regex : req.body.item_name_ar, $options : 'i'}}, {item_name : {$regex : req.body.item_name_ar, $options : 'i'}}, {item_description : {$regex : req.body.item_name_ar, $options : 'i'}}], ...detailValue};
      details = {
        $and: [
          {
            $or: [
              {
                item_name: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_tags: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_description: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_name_ar: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
              {
                item_description_ar: {
                  $regex: req.body.item_name,
                  $options: "i",
                },
              },
            ],
          },
          detailValue,
        ],
      };
    } else {
      details = detailValue;
    }
    Inventory.find(details)
      .populate("created_by", {
        user_password: 0,
        user_likes: 0,
        noofquotes: 0,
      })
      .populate("item_category")
      .populate("item_subcategory")
      .populate("item_mentions", { user_password: 0 })
      .sort({ item_featured: -1, created_at: -1 })
      //.sort({'created_at' : -1})
      .skip(parseInt(req.body.offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_by_id = function (item_id) {
  return new Promise(function (resolve, reject) {
    Inventory.find({ item_id: item_id })
      .populate("created_by", { user_password: 0 })
      .populate("item_category")
      .populate("item_subcategory")
      .populate("item_mentions", { user_password: 0 })
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_inventory_by_user = function (created_by, status) {
  return new Promise(function (resolve, reject) {
    user_oid = ObjectId(created_by);
    Inventory.find({ created_by: user_oid, status: status })
      .populate("item_category")
      .populate("item_subcategory")
      .populate("item_mentions", { user_password: 0 })
      .populate("created_by")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_inventory = function (req, res) {
  return new Promise(function (resolve, reject) {
    let InventoryID = uniqid();
    Inventory.create({
      item_id: InventoryID,
      item_img: req.body.item_img ? req.body.item_img.split(",") : [],
      item_name: req.body.item_name,
      item_name_ar: req.body.item_name_ar,
      item_description: req.body.item_description,
      item_description_ar: req.body.item_description_ar,
      item_type: req.body.item_type,
      item_visibility: req.body.item_visibility,
      status: req.body.status,
      item_category: req.body.item_category,
      item_subcategory: req.body.item_subcategory,
      item_space: req.body.item_space,
      item_brand: req.body.item_brand,
      item_cost: req.body.item_cost,
      item_theme_color: req.body.item_theme_color,
      created_by: req.body.created_by,
    })
      .then((Inv) => {
        if (req.body.optype) {
          if (req.body.optype === "Add") {
            if (
              req.body.item_img &&
              req.body.item_tags &&
              req.body.item_mentions
            ) {
              this.update_inventory_arrays(
                "Add",
                req.body.item_img,
                req.body.item_tags,
                req.body.item_mentions,
                InventoryID
              ).then((response) => {
                resolve(
                  resObj.content_operation_responses("Updated", response)
                );
              });
            } else if (
              req.body.item_img &&
              req.body.item_tags &&
              !req.body.item_mentions
            ) {
              this.update_inventory_img_tag(
                "Add",
                req.body.item_img,
                req.body.item_tags,
                InventoryID
              ).then((response) => {
                resolve(
                  resObj.content_operation_responses("Updated", response)
                );
              });
            } else if (
              req.body.item_tags &&
              req.body.item_mentions &&
              !req.body.item_img
            ) {
              this.update_inventory_tag_mention(
                "Add",
                req.body.item_tags,
                req.body.item_mentions,
                InventoryID
              ).then((response) => {
                resolve(
                  resObj.content_operation_responses("Updated", response)
                );
              });
            } else if (
              req.body.item_img &&
              req.body.item_mentions &&
              !req.body.item_tags
            ) {
              this.update_inventory_img_mention(
                "Add",
                req.body.item_img,
                req.body.item_mentions,
                InventoryID
              ).then((response) => {
                resolve(
                  resObj.content_operation_responses("Updated", response)
                );
              });
            } else if (
              req.body.item_img &&
              !req.body.item_tags &&
              !req.body.item_mentions
            ) {
              this.update_inventory_img(
                "Add",
                req.body.item_img,
                InventoryID
              ).then((response) => {
                resolve(
                  resObj.content_operation_responses("Updated", response)
                );
              });
            } else if (
              req.body.item_tags &&
              !req.body.item_img &&
              !req.body.item_mentions
            ) {
              this.update_inventory_tag(
                "Add",
                req.body.item_tags,
                InventoryID
              ).then((response) => {
                resolve(
                  resObj.content_operation_responses("Updated", response)
                );
              });
            } else if (
              req.body.item_mentions &&
              !req.body.item_tags &&
              !req.body.item_img
            ) {
              this.update_inventory_mention(
                "Add",
                req.body.item_mentions,
                InventoryID
              ).then((response) => {
                resolve(
                  resObj.content_operation_responses("Updated", response)
                );
              });
            } else {
              resolve(resObj.content_operation_responses("Created", Inv));
            }
          }
        } else {
          resolve(resObj.content_operation_responses("Created", Inv));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.search_inventory_by_tag = function (req, res) {
  Inventory.find({ item_tags: req.body.tag })
    .populate("created_by", { user_password: 0, user_likes: 0, noofquotes: 0 })
    .populate("item_category")
    .populate("item_subcategory")
    .exec()
    .then((items) => {
      res
        .status(200)
        .json({ success: true, message: "Data fetched", details: items });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: "Error", error });
    });
};

module.exports.update_inventory = function (req, res) {
  // console.log(req.body);
  return new Promise(function (resolve, reject) {
    Inventory.findOne(
      { item_id: req.body.item_id, created_by: req.body.created_by },
      function (err, inventorydata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (inventorydata) {
            inventorydata.item_name =
              req.body.item_name || inventorydata.item_name;

            inventorydata.item_description =
              req.body.item_description || inventorydata.item_description;
            inventorydata.item_name_ar =
              req.body.item_name_ar || inventorydata.item_name_ar;
            inventorydata.item_description_ar =
              req.body.item_description_ar || inventorydata.item_description_ar;
            inventorydata.item_type =
              req.body.item_type || inventorydata.item_type;
            inventorydata.item_visibility =
              req.body.item_visibility || inventorydata.item_visibility;
            inventorydata.status = req.body.status || inventorydata.status;
            inventorydata.item_category =
              req.body.item_category || inventorydata.item_category;
            inventorydata.item_subcategory =
              req.body.item_subcategory || inventorydata.item_subcategory;
            inventorydata.item_space =
              req.body.item_space || inventorydata.item_space;
            inventorydata.item_brand =
              req.body.item_brand || inventorydata.item_brand;
            inventorydata.item_cost =
              req.body.item_cost || inventorydata.item_cost;
            inventorydata.item_theme_color =
              req.body.item_theme_color || inventorydata.item_theme_color;
            inventorydata.created_by =
              req.body.created_by || inventorydata.created_by;
            inventorydata.item_featured =
              req.body.item_featured || inventorydata.item_featured;
            inventorydata.item_main_img_index =
              req.body.item_main_img_index || inventorydata.item_main_img_index;
            inventorydata
              .save({ new: true })
              .then((result) => {
                if (req.body.optype) {
                  if (req.body.optype === "Add") {
                    if (
                      req.body.item_img &&
                      req.body.item_tags &&
                      req.body.item_mentions
                    ) {
                      this.update_inventory_arrays(
                        "Add",
                        req.body.item_img,
                        req.body.item_tags,
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (req.body.item_img && req.body.item_tags) {
                      this.update_inventory_img_tag(
                        "Add",
                        req.body.item_img,
                        req.body.item_tags,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (req.body.item_tags && req.body.item_mentions) {
                      this.update_inventory_tag_mention(
                        "Add",
                        req.body.item_tags,
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (req.body.item_img && req.body.item_mentions) {
                      this.update_inventory_img_mention(
                        "Add",
                        req.body.item_img,
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (
                      req.body.item_img &&
                      !req.body.item_tags &&
                      !req.body.item_mentions
                    ) {
                      this.update_inventory_img(
                        "Add",
                        req.body.item_img,
                        req.body.item_id
                      ).then((response) => {
                        // console.log(response);
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (
                      req.body.item_tags &&
                      !req.body.item_img &&
                      !req.body.item_mentions
                    ) {
                      this.update_inventory_tag(
                        "Add",
                        req.body.item_tags,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (
                      req.body.item_mentions &&
                      !req.body.item_tags &&
                      !req.body.item_img
                    ) {
                      this.update_inventory_mention(
                        "Add",
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else {
                    }
                  } else if (req.body.optype === "Remove") {
                    if (
                      req.body.item_img &&
                      req.body.item_tags &&
                      req.body.item_mentions
                    ) {
                      this.update_inventory_arrays(
                        "Remove",
                        req.body.item_img,
                        req.body.item_tags,
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (req.body.item_img && req.body.item_tags) {
                      this.update_inventory_img_tag(
                        "Remove",
                        req.body.item_img,
                        req.body.item_tags,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (req.body.item_tags && req.body.item_mentions) {
                      this.update_inventory_tag_mention(
                        "Remove",
                        req.body.item_tags,
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (req.body.item_img && req.body.item_mentions) {
                      this.update_inventory_img_mention(
                        "Remove",
                        req.body.item_img,
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (
                      req.body.item_img &&
                      !req.body.item_tags &&
                      !req.body.item_mentions
                    ) {
                      this.update_inventory_img(
                        "Remove",
                        req.body.item_img,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (
                      req.body.item_tags &&
                      !req.body.item_img &&
                      !req.body.item_mentions
                    ) {
                      this.update_inventory_tag(
                        "Remove",
                        req.body.item_tags,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else if (
                      req.body.item_mentions &&
                      !req.body.item_tags &&
                      !req.body.item_img
                    ) {
                      this.update_inventory_mention(
                        "Remove",
                        req.body.item_mentions,
                        req.body.item_id
                      ).then((response) => {
                        resolve(
                          resObj.content_operation_responses(
                            "Updated",
                            response
                          )
                        );
                      });
                    } else {
                    }
                  }
                } else {
                  Inventory.findOne({
                    item_id: req.body.item_id,
                  })
                    .populate("created_by")
                    .populate("item_category")
                    .populate("item_subcategory")
                    .exec()
                    .then((resp) => {
                      resolve(
                        resObj.content_operation_responses("Updated", resp)
                      );
                    });
                }
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

/**
 * Remove a tag from a specific inventory (does NOT delete the tag from the database)
 */
module.exports.remove_tag_from_inventory = async function (req, res) {
  try {
    const { inventory_id, tag_id } = req.body;

    if (!inventory_id || !tag_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields", code: 400 });
    }

    // Find the inventory
    const inventory = await InventorySc.findById(inventory_id);
    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, error: "Inventory not found", code: 404 });
    }

    // Remove the tag from the inventory's item_tags array
    const beforeCount = inventory.item_tags.length;
    inventory.item_tags = inventory.item_tags.filter(
      (id) => id.toString() !== tag_id.toString()
    );
    const afterCount = inventory.item_tags.length;

    if (beforeCount === afterCount) {
      return res
        .status(200)
        .json({ success: true, message: "Tag was not present in inventory" });
    }

    await inventory.save();

    return res
      .status(200)
      .json({ success: true, message: "Tag removed from inventory" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message || error, code: 500 });
  }
};

update_inventory_img = function (optype, item_img, item_id) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      item_img = item_img.split(",");
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $set: { item_img: [] } },
        { multi: true }
      )
        .exec()
        .then((resp_d) => {
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            { $addToSet: { item_img: { $each: item_img } } },
            { new: true }
          )
            .populate("item_mentions", { user_password: 0 })
            .populate("item_category")
            .populate("item_subcategory")
            .exec()
            .then((resp_data) => {
              resolve(resp_data);
            });
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $pull: { item_img: item_img } },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        });
    } else {
    }
  });
};

update_inventory_tag = function (optype, item_tags, item_id) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      item_tags = item_tags.split(",");
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $set: { item_tags: [] } },
        { multi: true }
      )
        .exec()
        .then((resp_d) => {
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            { $addToSet: { item_tags: { $each: item_tags } } },
            { new: true }
          )
            .populate("item_mentions", { user_password: 0 })
            .populate("item_category")
            .populate("item_subcategory")
            .exec()
            .then((resp_data) => {
              console.log(resp_data);
              resolve(resp_data);
            })
            .catch((error) => {
              console.log(error);
            });
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $pull: { item_tags: item_tags } },
        { new: true }
      )
        .populate("item_category")
        .populate("item_mentions", { user_password: 0 })
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        });
    } else {
    }
  });
};

update_inventory_mention = function (optype, item_mentions, item_id) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      item_mentions = item_mentions.split(",");
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $set: { item_mentions: [] } },
        { multi: true }
      )
        .exec()
        .then((resp_d) => {
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            {
              $addToSet: {
                item_mentions: { $each: item_mentions },
              },
            },
            { new: true }
          )
            .populate("item_mentions", { user_password: 0 })
            .populate("item_category")
            .populate("item_subcategory")
            .exec()
            .then((resp_data) => {
              console.log(resp_data);
              resolve(resp_data);
            })
            .catch((error) => {
              console.log(error);
            });
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $pull: { item_mentions: item_mentions } },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        });
    } else {
    }
  });
};

update_inventory_arrays = function (
  optype,
  item_img,
  item_tags,
  item_mentions,
  item_id
) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      item_mentions = item_mentions.split(",");
      item_tags = item_tags.split(",");
      item_img = item_img.split(",");

      // Process hashtags before updating
      module.exports
        .processHashtags(item_tags)
        .then(() => {
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            { $set: { item_mentions: [], item_tags: [], item_img: [] } },
            { multi: true }
          )
            .exec()
            .then((resp_d) => {
              Inventory.findOneAndUpdate(
                { item_id: item_id },
                {
                  $addToSet: {
                    item_mentions: { $each: item_mentions },
                    item_tags: { $each: item_tags },
                    item_img: { $each: item_img },
                  },
                },
                { new: true }
              )
                .populate("item_mentions", { user_password: 0 })
                .populate("item_category")
                .populate("item_subcategory")
                .exec()
                .then((resp_data) => {
                  console.log(resp_data);
                  resolve(resp_data);
                  //resolve(resObj.content_operation_responses("Updated", resp_data))
                })
                .catch((error) => {
                  console.log(error);
                  resolve(error);
                });
            })
            .catch((error) => {
              console.log(error);
              resolve(error);
            });
        })
        .catch((error) => {
          console.log("Error processing hashtags:", error);

          // Continue with the update even if hashtag processing fails
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            { $set: { item_mentions: [], item_tags: [], item_img: [] } },
            { multi: true }
          )
            .exec()
            .then((resp_d) => {
              Inventory.findOneAndUpdate(
                { item_id: item_id },
                {
                  $addToSet: {
                    item_mentions: { $each: item_mentions },
                    item_tags: { $each: item_tags },
                    item_img: { $each: item_img },
                  },
                },
                { new: true }
              )
                .populate("item_mentions", { user_password: 0 })
                .populate("item_category")
                .populate("item_subcategory")
                .exec()
                .then((resp_data) => {
                  console.log(resp_data);
                  resolve(resp_data);
                })
                .catch((error) => {
                  console.log(error);
                  resolve(error);
                });
            })
            .catch((error) => {
              console.log(error);
              resolve(error);
            });
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        {
          $pull: {
            img_mentions: img_mentions,
            item_tags: item_tags,
            item_img: item_img,
          },
        },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          //resolve(resObj.content_operation_responses("Updated", resp_data))
          resolve(resp_data);
        });
    } else {
    }
  });
};

update_inventory_img_tag = function (optype, item_img, item_tags, item_id) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      // item_tags = item_tags?.split(",");
      item_img = item_img?.split(",");

      // Ensure item_tags and item_img are arrays
      if (Array.isArray(item_tags)) {
        // Use as is
      } else if (typeof item_tags === "string") {
        item_tags = item_tags.split(",");
      } else {
        item_tags = [];
      }

      if (Array.isArray(item_img)) {
        // Use as is
      } else if (typeof item_img === "string") {
        item_img = item_img.split(",");
      } else {
        item_img = [];
      }

      // Process hashtags before updating
      module.exports
        .processHashtags(item_tags)
        .then(() => {
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            { $set: { item_tags: [], item_img: [] } },
            { multi: true }
          )
            .exec()
            .then((resp_d) => {
              Inventory.findOneAndUpdate(
                { item_id: item_id },
                {
                  $addToSet: {
                    item_tags: { $each: item_tags },
                    item_img: { $each: item_img },
                  },
                },
                { new: true }
              )
                .populate("item_mentions", { user_password: 0 })
                .populate("item_category")
                .populate("item_subcategory")
                .exec()
                .then((resp_data) => {
                  console.log(resp_data);
                  resolve(resp_data);
                  //resolve(resObj.content_operation_responses("Updated", resp_data))
                })
                .catch((error) => {
                  console.log(error);
                  resolve(error);
                });
            })
            .catch((error) => {
              console.log(error);
              resolve(error);
            });
        })
        .catch((error) => {
          console.log("Error processing hashtags:", error);

          // Continue with the update even if hashtag processing fails
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            { $set: { item_tags: [], item_img: [] } },
            { multi: true }
          )
            .exec()
            .then((resp_d) => {
              Inventory.findOneAndUpdate(
                { item_id: item_id },
                {
                  $addToSet: {
                    item_tags: { $each: item_tags },
                    item_img: { $each: item_img },
                  },
                },
                { new: true }
              )
                .populate("item_mentions", { user_password: 0 })
                .populate("item_category")
                .populate("item_subcategory")
                .exec()
                .then((resp_data) => {
                  console.log(resp_data);
                  resolve(resp_data);
                })
                .catch((error) => {
                  console.log(error);
                  resolve(error);
                });
            })
            .catch((error) => {
              console.log(error);
              resolve(error);
            });
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $pull: { item_tags: item_tags, item_img: item_img } },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          //resolve(resObj.content_operation_responses("Updated", resp_data))
          resolve(resp_data);
        });
    } else {
    }
  });
};

update_inventory_img_mention = function (
  optype,
  item_img,
  item_mentions,
  item_id
) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      item_mentions = item_mentions.split(",");
      item_img = item_img.split(",");
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $set: { item_mentions: [], item_img: [] } },
        { multi: true }
      )
        .exec()
        .then((resp_d) => {
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            {
              $addToSet: {
                item_mentions: { $each: item_mentions },
                item_img: { $each: item_img },
              },
            },
            { new: true }
          )
            .populate("item_mentions", { user_password: 0 })
            .populate("item_category")
            .populate("item_subcategory")
            .exec()
            .then((resp_data) => {
              console.log(resp_data);
              resolve(resp_data);
              //resolve(resObj.content_operation_responses("Updated", resp_data))
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $pull: { item_mentions: item_mentions, item_img: item_img } },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          //resolve(resObj.content_operation_responses("Updated", resp_data))
          resolve(resp_data);
        });
    } else {
    }
  });
};

update_inventory_tag_mention = function (
  optype,
  item_tags,
  item_mentions,
  item_id
) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      item_tags = item_tags.split(",");
      item_mentions = item_mentions.split(",");
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $set: { item_mentions: [], item_tags: [] } },
        { multi: true }
      )
        .exec()
        .then((resp_d) => {
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            {
              $addToSet: {
                item_mentions: { $each: item_mentions },
                item_tags: { $each: item_tags },
              },
            },
            { new: true }
          )
            .populate("item_mentions", { user_password: 0 })
            .populate("item_category")
            .populate("item_subcategory")
            .exec()
            .then((resp_data) => {
              console.log(resp_data);
              resolve(resp_data);
              //resolve(resObj.content_operation_responses("Updated", resp_data))
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        {
          $pull: {
            item_mentions: item_mentions,
            item_tags: item_tags,
          },
        },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          //resolve(resObj.content_operation_responses("Updated", resp_data))
          resolve(resp_data);
        });
    } else {
    }
  });
};

module.exports.update_inventory_public = function (
  item_id,
  optype,
  attribute,
  user_id
) {
  return new Promise(function (resolve, reject) {
    Inventory.findOne({ item_id: item_id }, function (err, itemdata) {
      if (err) {
        reject("Invalid");
      } else {
        switch (attribute) {
          case "like":
            if (optype === "Add") {
              this.update_user_likes(optype, user_id, item_id).then((resp) => {
                console.log("User like updated");
                itemdata.item_likes = itemdata.item_likes + 1;
                itemdata.save({ new: true }).then((result) => {
                  Inventory.findOne({ item_id: item_id })
                    .populate("item_mentions", {
                      user_password: 0,
                    })
                    .populate("created_by")
                    .populate("item_category")
                    .populate("item_subcategory")
                    .exec()
                    .then((resp) => {
                      resolve(
                        resObj.content_operation_responses("Updated", resp)
                      );
                    });
                });
              });
            } else if (optype === "Remove") {
              this.update_user_likes(optype, user_id, item_id).then((resp) => {
                console.log("User like updated");
                if (itemdata.item_likes > 0) {
                  itemdata.item_likes = itemdata.item_likes - 1;
                  itemdata.save({ new: true }).then((result) => {
                    Inventory.findOne({
                      item_id: item_id,
                    })
                      .populate("item_mentions", {
                        user_password: 0,
                      })
                      .populate("created_by")
                      .populate("item_category")
                      .populate("item_subcategory")
                      .exec()
                      .then((resp) => {
                        resolve(
                          resObj.content_operation_responses("Updated", resp)
                        );
                      });
                  });
                }
              });
            }
            break;
          case "share":
            if (optype === "Add") {
              itemdata.item_shares = itemdata.item_shares + 1;
              itemdata.save({ new: true }).then((result) => {
                Inventory.findOne({ item_id: item_id })
                  .populate("item_mentions", {
                    user_password: 0,
                  })
                  .populate("created_by")
                  .populate("item_category")
                  .populate("item_subcategory")
                  .exec()
                  .then((resp) => {
                    resolve(
                      resObj.content_operation_responses("Updated", resp)
                    );
                  });
              });
            } else if (optype === "Remove") {
              if (itemdata.item_shares > 0) {
                itemdata.item_shares = itemdata.item_shares - 1;
                itemdata.save({ new: true }).then((result) => {
                  Inventory.findOne({ item_id: item_id })
                    .populate("item_mentions", {
                      user_password: 0,
                    })
                    .populate("created_by")
                    .populate("item_category")
                    .populate("item_subcategory")
                    .exec()
                    .then((resp) => {
                      resolve(
                        resObj.content_operation_responses("Updated", resp)
                      );
                    });
                });
              }
            }
            break;
        }
      }
    });
  });
};

module.exports.update_inventory_comment = function (optype, comment, item_id) {
  return new Promise(function (resolve, reject) {
    //user_oid = ObjectId(user_oid);
    if (optype === "Add") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $push: { item_comments: comment } },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("created_by")
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        });
    } else if (optype === "Remove") {
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $pull: { item_comments: { _id: comment._id } } },
        { new: true }
      )
        .populate("item_mentions", { user_password: 0 })
        .populate("created_by")
        .populate("item_category")
        .populate("item_subcategory")
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        });
    } else {
    }
  });
};

module.exports.delete_inventory = function (item_id, created_by) {
  console.log(item_id, created_by);
  return new Promise(function (resolve, reject) {
    Inventory.findOne({ item_id: item_id, created_by: created_by })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

////////////////////////////////Filters///////////////////////////////////////////////////////////

module.exports.search_business_filter = function (filter_name, filter_name_ar) {
  return new Promise(function (resolve, reject) {
    BusinessFilter.find()
      .or([{ filter_name: filter_name }, { filter_name_ar: filter_name_ar }])
      .exec()
      .then((resp) => {
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_business_filter_all = function () {
  return new Promise(function (resolve, reject) {
    BusinessFilter.find()
      .sort({ updated_at: -1 })
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_business_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    let FilterID = uniqid();
    BusinessFilter.create({
      filter_id: FilterID,
      filter_name: req.body.filter_name,
      filter_name_ar: req.body.filter_name_ar,
      filter_type: req.body.filter_type,
      status: req.body.status,
      // filter_img : req.body.filter_img,
      // filter_category: req.body.filter_category,
      // filter_category_ar: req.body.filter_category_ar,
      // filter_subcategory: req.body.filter_subcategory,
      // filter_subcategory_ar: req.body.filter_subcategory_ar,
      // filter_theme_color: req.body.filter_theme_color,
      created_by: req.body.created_by,
    })
      .then((Fil) => {
        resolve(resObj.content_operation_responses("Created", Fil));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_business_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    BusinessFilter.findOne(
      { filter_id: req.body.filter_id, created_by: req.body.created_by },
      function (err, filterdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (filterdata) {
            filterdata.filter_name =
              req.body.filter_name || filterdata.filter_name;
            filterdata.filter_name_ar =
              req.body.filter_name_ar || filterdata.filter_name_ar;
            filterdata.filter_type =
              req.body.filter_type || filterdata.filter_type;
            filterdata.filter_img =
              req.body.filter_img || filterdata.filter_img;
            filterdata.status = req.body.status || filterdata.status;
            filterdata.filter_category =
              req.body.filter_category || filterdata.filter_category;
            filterdata.filter_category_ar =
              req.body.filter_category_ar || filterdata.filter_category_ar;
            filterdata.filter_subcategory =
              req.body.filter_subcategory || filterdata.filter_subcategory;
            filterdata.filter_subcategory_ar =
              req.body.filter_subcategory_ar ||
              filterdata.filter_subcategory_ar;
            filterdata.item_theme_color =
              req.body.filter_theme_color || filterdata.filter_theme_color;
            filterdata.created_by =
              req.body.created_by || filterdata.created_by;
            filterdata
              .save({ new: true })
              .then((result) => {
                if (
                  req.body.filter_name &&
                  req.body.filter_name_ar &&
                  req.body.optype
                ) {
                  if (req.body.optype === "Add") {
                    this.update_business_filter_name(
                      "Add",
                      req.body.filter_name,
                      req.body.filter_name_ar,
                      req.body.filter_id
                    ).then((response) => {
                      resolve(
                        resObj.content_operation_responses("Updated", response)
                      );
                    });
                  } else if (req.body.optype === "Remove") {
                    this.update_business_filter_name(
                      "Remove",
                      req.body.filter_name,
                      req.body.filter_name_ar,
                      req.body.filter_id
                    ).then((response) => {
                      resolve(
                        resObj.content_operation_responses("Updated", response)
                      );
                    });
                  }
                } else {
                  resolve(
                    resObj.content_operation_responses("Updated", result)
                  );
                }
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

update_business_filter_name = function (
  optype,
  filter_name,
  filter_name_ar,
  filter_id
) {
  return new Promise(function (resolve, reject) {
    console.log(optype);
    let fil_combined = { value_en: filter_name, value_ar: filter_name_ar };
    if (optype === "Add") {
      //filter_name = filter_name.split(",");
      //filter_name_ar = filter_name_ar.split(",");
      console.log(fil_combined);
      BusinessFilter.findOneAndUpdate(
        { filter_id: filter_id },
        {
          $addToSet: {
            filter_names: fil_combined,
            filter_names_ar: fil_combined,
          },
        },
        { new: true }
      )
        .exec()
        .then((resp_data) => {
          console.log(resp_data);
          resolve(resp_data);
        })
        .catch((error) => {
          resolve(resObj.content_operation_responses("Error", error));
        });
    } else if (optype === "Remove") {
      BusinessFilter.findOneAndUpdate(
        { filter_id: filter_id },
        {
          $pull: {
            filter_names: fil_combined,
            filter_names_ar: fil_combined,
          },
        },
        { new: true }
      )
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        })
        .catch((error) => {
          resolve(resObj.content_operation_responses("Error", error));
        });
    } else {
    }
  });
};

module.exports.delete_business_filter = function (filter_id, created_by) {
  return new Promise(function (resolve, reject) {
    BusinessFilter.findOne({ filter_id: filter_id, created_by: created_by })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.search_inventory_filter = function (
  filter_name,
  filter_name_ar
) {
  return new Promise(function (resolve, reject) {
    InventoryFilter.find()
      .or([{ filter_name: filter_name }, { filter_name_ar: filter_name_ar }])
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_inventory_filter_all = function (details) {
  return new Promise(function (resolve, reject) {
    InventoryFilter.find(details)
      .sort({ updated_at: -1 })
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_inventory_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    let FilterID = uniqid();
    InventoryFilter.create({
      filter_id: FilterID,
      filter_name: req.body.filter_name,
      filter_name_ar: req.body.filter_name_ar,
      filter_type: req.body.filter_type,
      status: req.body.status,
      filter_img: req.body.filter_img,
      filter_category: req.body.filter_category,
      filter_category_ar: req.body.filter_category_ar,
      filter_subcategory: req.body.filter_subcategory,
      filter_subcategory_ar: req.body.filter_subcategory_ar,
      filter_theme_color: req.body.filter_theme_color,
      created_by: req.body.created_by,
    })
      .then((Fil) => {
        resolve(resObj.content_operation_responses("Created", Fil));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_inventory_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    InventoryFilter.findOne(
      { filter_id: req.body.filter_id, created_by: req.body.created_by },
      function (err, filterdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (filterdata) {
            filterdata.filter_name =
              req.body.filter_name || filterdata.filter_name;
            filterdata.filter_name_ar =
              req.body.filter_name_ar || filterdata.filter_name_ar;
            filterdata.filter_type =
              req.body.filter_type || filterdata.filter_type;
            filterdata.filter_img =
              req.body.filter_img || filterdata.filter_img;
            filterdata.status = req.body.status || filterdata.status;
            filterdata.filter_category =
              req.body.filter_category || filterdata.filter_category;
            filterdata.filter_category_ar =
              req.body.filter_category_ar || filterdata.filter_category_ar;
            filterdata.filter_subcategory =
              req.body.filter_subcategory || filterdata.filter_subcategory;
            filterdata.filter_subcategory_ar =
              req.body.filter_subcategory_ar ||
              filterdata.filter_subcategory_ar;
            filterdata.item_theme_color =
              req.body.filter_theme_color || filterdata.filter_theme_color;
            filterdata.created_by =
              req.body.created_by || filterdata.created_by;
            filterdata
              .save({ new: true })
              .then((result) => {
                if (
                  req.body.filter_name &&
                  req.body.filter_name_ar &&
                  req.body.optype
                ) {
                  if (req.body.optype === "Add") {
                    this.update_inventory_filter_name(
                      "Add",
                      req.body.filter_name,
                      req.body.filter_name_ar,
                      req.body.filter_id
                    ).then((response) => {
                      resolve(
                        resObj.content_operation_responses("Updated", response)
                      );
                    });
                  } else if (req.body.optype === "Remove") {
                    this.update_inventory_filter_name(
                      "Remove",
                      req.body.filter_name,
                      req.body.filter_name_ar,
                      req.body.filter_id
                    ).then((response) => {
                      resolve(
                        resObj.content_operation_responses("Updated", response)
                      );
                    });
                  }
                } else {
                  resolve(
                    resObj.content_operation_responses("Updated", result)
                  );
                }
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

update_inventory_filter_name = function (
  optype,
  filter_name,
  filter_name_ar,
  filter_id
) {
  return new Promise(function (resolve, reject) {
    let fil_combined = { value_en: filter_name, value_ar: filter_name_ar };
    if (optype === "Add") {
      //filter_name = filter_name.split(",");
      //filter_name_ar = filter_name_ar.split(",");
      InventoryFilter.findOneAndUpdate(
        { filter_id: filter_id },
        {
          $addToSet: {
            filter_names: fil_combined,
            filter_names_ar: fil_combined,
          },
        },
        { new: true }
      )
        .exec()
        .then((resp_data) => {
          resolve(resp_data);
        })
        .catch((error) => {
          resolve(resObj.content_operation_responses("Error", error));
        });
    } else if (optype === "Remove") {
      InventoryFilter.findOneAndUpdate(
        { filter_id: filter_id },
        {
          $pull: {
            filter_names: fil_combined,
            filter_names_ar: fil_combined,
          },
        },
        { new: true }
      )
        .exec()
        .then((resp_data) => {
          resolve(resObj.content_operation_responses("Updated", resp_data));
        })
        .catch((error) => {
          resolve(resObj.content_operation_responses("Error", error));
        });
    } else {
    }
  });
};

module.exports.delete_inventory_filter = function (filter_id, created_by) {
  return new Promise(function (resolve, reject) {
    InventoryFilter.findOne({
      filter_id: filter_id,
      created_by: created_by,
    })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//*****************************************Blog****************************************************************

module.exports.search_blog = function (blog_title, blog_title_ar) {
  return new Promise(function (resolve, reject) {
    Blog.find()
      .or([{ blog_title: blog_title }, { blog_title_ar: blog_title_ar }])
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_blog_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    let details = req.body.details;
    if (req.body.blog_title) {
      details.blog_title = { $regex: req.body.blog_title, $options: "i" };
    }
    if (req.body.blog_title_ar) {
      details.blog_title_ar = {
        $regex: req.body.blog_title_ar,
        $options: "i",
      };
    }
    Blog.find(details)
      .sort({ updated_at: -1 })
      .skip(parseInt(req.body.offset) * ConstantCtrl.limit)
      .limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_blog_by_user = function (created_by, status) {
  return new Promise(function (resolve, reject) {
    user_oid = ObjectId(created_by);
    Blog.find({ created_by: user_oid, status: status })
      .populate("created_by")
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.read_blog_by_id = function (blog_id, status) {
  return new Promise(function (resolve, reject) {
    Blog.find({ blog_id: blog_id, status: status })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_blog = function (req, res) {
  return new Promise(function (resolve, reject) {
    let BlogID = uniqid();
    // let user_oid = req.body.created_by;
    Blog.create({
      blog_id: BlogID,
      blog_title: req.body.blog_title,
      blog_title_ar: req.body.blog_title_ar,
      blog_body: req.body.blog_body,
      blog_body_ar: req.body.blog_body_ar,
      blog_img: req.body.blog_img,
      blog_theme_color: req.body.blog_theme_color,
      blog_type: req.body.blog_type,
      blog_likes: req.body.blog_likes,
      blog_shares: req.body.blog_shares,
      blog_bookmarks: req.body.blog_bookmarks,
      blog_comments: req.body.blog_comments,
      created_by: req.body.created_by,
      status: req.body.status,
    })
      .then((Blog) => {
        resolve(resObj.content_operation_responses("Created", Blog));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_blog = function (req, res) {
  return new Promise(function (resolve, reject) {
    Blog.findOne(
      { blog_id: req.body.blog_id, created_by: req.body.created_by },
      function (err, blogdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (blogdata) {
            blogdata.blog_title = req.body.blog_title || blogdata.blog_title;
            blogdata.blog_title_ar =
              req.body.blog_title_ar || blogdata.blog_title_ar;
            blogdata.blog_body = req.body.blog_body || blogdata.blog_body;
            blogdata.blog_body_ar =
              req.body.blog_body_ar || blogdata.blog_body_ar;
            blogdata.blog_img = req.body.blog_img || blogdata.blog_img;
            blogdata.blog_theme_color =
              req.body.blog_theme_color || blogdata.blog_theme_color;
            blogdata.blog_type = req.body.blog_type || blogdata.blog_type;
            blogdata.created_by = req.body.created_by || blogdata.created_by;
            blogdata.status = req.body.status || blogdata.status;
            blogdata
              .save({ new: true })
              .then((result) => {
                Blog.findOne({ blog_id: req.body.blog_id })
                  .exec()
                  .then((resp) => {
                    resolve(resObj.user_operation_responses("Updated", resp));
                  })
                  .catch((error) => {
                    console.log(error);
                    resolve(resObj.content_operation_responses("Error", error));
                  });
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_blog = function (blog_id, created_by) {
  return new Promise(function (resolve, reject) {
    Blog.findOne({ blog_id: blog_id, created_by: created_by })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

///////////// admin Handler //////////////////////////////////////////////////

module.exports.admin_create = function (req, res) {
  return new Promise(function (resolve, reject) {
    let adminID = uniqid();
    const saltRounds = 10;
    bcrypt
      .hash(req.body.admin_password, saltRounds)
      .then((hash) => {
        return hash;
      })
      .then((password) => {
        Admin.create({
          admin_id: adminID,
          admin_name: req.body.admin_name,
          admin_address: req.body.admin_address,
          admin_img: req.body.admin_img,
          admin_email: req.body.admin_email,
          admin_password: password,
          smtp_email: req.body.smtp_email,
          smtp_password: req.body.smtp_password,
        })
          .then((adminContent) => {
            adminContent.user_password = undefined;
            resolve(resObj.register_resp("Registered", adminContent));
          })
          .catch((error) => {
            console.log(error);
            resolve(resObj.register_resp("Error", error));
          });
      });
  });
};

module.exports.search_admin = function (admin_email) {
  return new Promise(function (resolve, reject) {
    Admin.find({ admin_email: admin_email, status: "approved" })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.admin_login = function (admin_email) {
  return new Promise(function (resolve, reject) {
    Admin.find({ admin_email: admin_email, status: "approved" })
      .exec()
      .then((resp) => {
        resolve(resp);
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.admin_forgotpassword = function (req, res) {
  return new Promise(function (resolve, reject) {
    Admin.findOne({ admin_email: req.body.admin_email, status: "approved" })
      .sort({ updated_at: -1 })
      .exec()
      .then((resp) => {
        if (resp) {
          console.log(resp);
          //forgot password mail
          req.body.email = resp.admin_email;
          req.body.user_name = resp.admin_name;
          req.body.subject_body = "Forgot Password";
          req.body.type = "adminforgotpassword";
          req.body._id = resp._id;
          Notification.send_mail(req, res);

          resolve(resObj.user_operation_responses("Updated", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "error"));
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.admin_changepassword = function (req, res) {
  return new Promise(function (resolve, reject) {
    Admin.findOne(
      { _id: req.body.id, status: "approved" },
      function (err, admindata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (admindata) {
            const saltRounds = 10;
            bcrypt
              .hash(req.body.admin_password, saltRounds)
              .then((hash) => {
                return hash;
              })
              .then((password) => {
                admindata.admin_name =
                  req.body.admin_name || admindata.admin_name;
                admindata.admin_address =
                  req.body.admin_address || admindata.admin_address;
                admindata.admin_img = req.body.admin_img || admindata.admin_img;
                admindata.admin_email =
                  req.body.admin_email || admindata.admin_email;
                admindata.smtp_email =
                  req.body.smtp_email || admindata.smtp_email;
                admindata.smtp_password =
                  req.body.smtp_password || admindata.smtp_password;
                admindata.admin_password = password || admindata.admin_password;
                admindata
                  .save({ new: true })
                  .then((result) => {
                    resolve(
                      resObj.user_operation_responses("Updated", admindata)
                    );
                  })
                  .catch((error) => {
                    console.log(error);
                    resolve(resObj.content_operation_responses("Error", error));
                  });
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    ).catch((error) => {
      resolve("Try again");
    });
  });
};
module.exports.admin_update = function (req, res) {
  return new Promise(function (resolve, reject) {
    Admin.findOne({ _id: req.body.id }, function (err, admindata) {
      if (err) {
        //console.log(err);
        resolve(resObj.content_operation_responses("Error", err));
      } else {
        if (admindata) {
          admindata.admin_name = req.body.admin_name || admindata.admin_name;
          admindata.admin_address =
            req.body.admin_address || admindata.admin_address;
          admindata.admin_img = req.body.admin_img || admindata.admin_img;
          admindata.admin_email = req.body.admin_email || admindata.admin_email;
          admindata.smtp_email = req.body.smtp_email || admindata.smtp_email;
          admindata.smtp_password =
            req.body.smtp_password || admindata.smtp_password;
          admindata
            .save({ new: true })
            .then((result) => {
              resolve(resObj.user_operation_responses("Updated", admindata));
            })
            .catch((error) => {
              console.log(error);
              resolve(resObj.content_operation_responses("Error", error));
            });
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "error"));
        }
      }
    }).catch((error) => {
      resolve("Try again");
    });
  });
};

//////////////////Searches/////////////////////////////////////////////////////////////////////////////
module.exports.search_stats = function (start, end, search_type) {
  return new Promise(function (resolve, reject) {
    console.log(start, end, search_type);
    let start_date = isodate(start);
    let end_date = isodate(end);
    Search.find({
      search_type: search_type,
      updated_at: {
        $gte: start_date,
        $lt: end_date,
      },
    })
      .exec()
      .then((result) => {
        // console.log(`search stat (${search_type}): `, result);
        const Property = "search_term";
        const search_terms = _.groupBy(result, Property);
        let search_arr = [];
        for (i in search_terms) {
          const evaluation = search_terms[i].reduce(
            (evaluation, counter) => evaluation + counter.search_count, // reducer function
            0 // initial accumulator value
          );
          const search_val = search_terms[i].reduce(
            (search_val, val) => val.search_term, // reducer function
            0 // initial accumulator value
          );
          search_arr.push({
            search_term: search_val,
            search_count: evaluation,
          });
        }
        search_arr = sortJsonArray(search_arr, "search_count", "des");
        resolve(resObj.content_operation_responses("Fetch", search_arr));
      });
  });
};

////////////////////////////////Tag///////////////////////////////////////////////////////////

module.exports.search_tag = function (tag) {
  return new Promise(function (resolve, reject) {
    // If tag is less than 2 letters, return 'Allowed' (no tag can exist)
    if (!tag || tag.length < 2) {
      return resolve("Allowed");
    }
    // Use regex for loose search, case-insensitive, partial match
    Tag.find({ tag: { $regex: `^${tag}$`, $options: "i" } })
      .limit(1)
      .exec()
      .then((resp) => {
        if (resp && resp.length > 0) {
          resolve("Exists");
        } else {
          resolve("Allowed");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.create_tag = async function (req, res) {
  try {
    const { created_by, inventory_id, tag } = req.body;

    if (!created_by || !inventory_id || !tag) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields", code: 400 });
    }

    const settings = await Settings.findOne({});
    const maxLimit = settings ? settings.max_hashtag_limit : 5;

    // Count tags for the specific inventory and user
    const inventory = await InventorySc.findOne({
      _id: inventory_id,
      created_by,
    });

    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, error: "Inventory not found", code: 404 });
    }

    if (inventory.item_tags.length >= maxLimit) {
      return res
        .status(429)
        .json({ success: false, error: "Tag limit reached", code: 429 });
    }

    // Check if tag already exists (case-insensitive)
    let existingTag = await TagSc.findOne({
      tag: { $regex: `^${tag}$`, $options: "i" },
    });

    let tagToUse;
    if (existingTag) {
      tagToUse = existingTag;
    } else {
      // Create the tag if it doesn't exist
      const tagID = uniqid();
      tagToUse = await TagSc.create({
        tag_id: tagID,
        tag,
        created_by,
      });
    }

    // Add the tag's _id to the inventory if not already present
    if (!inventory.item_tags.includes(tagToUse._id.toString())) {
      inventory.item_tags.push(tagToUse._id);
      await inventory.save();
    }

    return res
      .status(201)
      .json({ success: true, message: "Tag created", details: tagToUse });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message || error, code: 500 });
  }
};

module.exports.read_tag_all = function () {
  return new Promise(function (resolve, reject) {
    Tag.find()
      .sort({ updated_at: -1 })
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_tag = function (req, res) {
  return new Promise(function (resolve, reject) {
    Tag.findOne({ tag_id: req.body.tag_id }, function (err, tagdata) {
      if (err) {
        //console.log(err);
        resolve(resObj.content_operation_responses("Error", err));
      } else {
        if (tagdata) {
          tagdata.tag = req.body.tag || tagdata.tag;
          tagdata
            .save({ new: true })
            .then((result) => {
              resolve(resObj.user_operation_responses("Updated", result));
            })
            .catch((error) => {
              console.log(error);
              resolve(resObj.content_operation_responses("Error", error));
            });
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "error"));
        }
      }
    });
  });
};

module.exports.delete_tag = async function (req, res) {
  try {
    const { tag_id } = req.body;

    if (!tag_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields", code: 400 });
    }

    // Remove the tag from all inventories that have it
    await InventorySc.updateMany(
      { item_tags: tag_id },
      { $pull: { item_tags: tag_id } }
    );

    // Delete the tag from the tags collection
    await TagSc.deleteOne({ _id: tag_id });

    return res.status(200).json({
      success: true,
      message: "Tag deleted from all inventories and removed from database",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message || error, code: 500 });
  }
};

module.exports.read_tag_by_id = function (req, res) {
  const _id = req.body.tag_id;
  Tag.find({ _id })
    .exec()
    .then((resp) => {
      console.log(resp);
      if (resp.length > 0) {
        res
          .status(200)
          .json({ success: true, message: "Data fetched", details: resp });
      } else {
        res.status(404).json({ success: false, message: "Data not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, error: error });
    });
};

module.exports.get_tags_by_inventory = async function (req, res) {
  try {
    const { inventory_id } = req.body;
    console.log("Fetching tags for inventory:", inventory_id);

    if (!inventory_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing inventory ID", code: 400 });
    }

    const inventory = await InventorySc.findById(inventory_id);

    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, error: "Inventory not found", code: 404 });
    }

    const tags = await TagSc.find({ tag_id: { $in: inventory.item_tags } });

    return res.status(200).json({ success: true, tags });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message || error, code: 500 });
  }
};

//*****************************************country****************************************************************

module.exports.search_country = function (country_name) {
  return new Promise(function (resolve, reject) {
    Country.find({ country_name: country_name })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_country = function (req, res) {
  return new Promise(function (resolve, reject) {
    let details = req.body.details;
    Country.find(details)
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_country = function (req, res) {
  return new Promise(function (resolve, reject) {
    let countryID = uniqid();
    // let user_oid = req.body.created_by;
    Country.create({
      country_id: countryID,
      country_name: req.body.country_name,
      code: req.body.code,
      status: req.body.status,
    })
      .then((Blog) => {
        resolve(resObj.content_operation_responses("Created", Blog));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_country = function (req, res) {
  return new Promise(function (resolve, reject) {
    Country.findOne({ _id: req.body.id }, function (err, blogdata) {
      if (err) {
        //console.log(err);
        resolve(resObj.content_operation_responses("Error", err));
      } else {
        if (blogdata) {
          blogdata.country_name =
            req.body.country_name || blogdata.country_name;
          blogdata.code = req.body.code || blogdata.code;
          blogdata.status = req.body.status || blogdata.status;
          blogdata
            .save({ new: true })
            .then((result) => {
              Country.findOne({ country_id: req.body.country_id })
                .exec()
                .then((resp) => {
                  resolve(resObj.user_operation_responses("Updated", resp));
                })
                .catch((error) => {
                  console.log(error);
                  resolve(resObj.content_operation_responses("Error", error));
                });
            })
            .catch((error) => {
              console.log(error);
              resolve(resObj.content_operation_responses("Error", error));
            });
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "error"));
        }
      }
    });
  });
};

module.exports.delete_country = function (id) {
  return new Promise(function (resolve, reject) {
    Country.findOne({ _id: id })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//*****************************************materiallist****************************************************************

module.exports.search_materiallist = function (item_name) {
  return new Promise(function (resolve, reject) {
    Materiallist.find({ item_name: item_name })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_materiallist = function (req, res) {
  return new Promise(function (resolve, reject) {
    let details = req.body.details;
    Materiallist.find(details)
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

function remove_item_if_exists_in_obj_list(item, list) {
  for (var i = 0; i < list.length; i++) {
    if (item === list[i].inventory_category_name) {
      list.splice(i, 1);
      return true;
    }
  }
  return false;
}

// This is after merging materials to be all inventory subcatgory + catgories
// wheneven no subcategory exist in that category
module.exports.read_materiallist_new = function (req, res) {
  return new Promise(function (resolve, reject) {
    // let inventoy_cates = InventoryCat.find();
    // let inventory_subcates = InventorySubCat.find();
    // let result = [];

    // inventoy_cates.map(cate => result.push({item_name}))

    // find categories which does not have subcategories
    // inventory_subcates.map(subcate => {
    //     let ret = remove_item_if_exists_in_obj_list(subcate.inventory_category_name, result);
    //     if(ret){

    //     }
    // })

    let details = req.body.details;
    Materiallist.find(details)
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_materiallist = function (req, res) {
  return new Promise(function (resolve, reject) {
    let materiallistID = uniqid();
    Materiallist.create({
      item_id: materiallistID,
      item_name: req.body.item_name,
      item_image: req.body.item_image,
      item_name_ar: req.body.item_name_ar,
      unit: req.body.unit,
      type: req.body.type,
      type_ar: req.body.type_ar,
      rate: req.body.rate,
      quantity: req.body.quantity,
      created_by: req.body.created_by,
      status: req.body.status,
    })
      .then((Blog) => {
        resolve(resObj.content_operation_responses("Created", Blog));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_materiallist = function (req, res) {
  return new Promise(function (resolve, reject) {
    Materiallist.findOne(
      { item_id: req.body.item_id },
      function (err, blogdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (blogdata) {
            blogdata.item_name = req.body.item_name || blogdata.item_name;
            blogdata.item_image = req.body.item_image || blogdata.item_image;
            blogdata.item_name_ar =
              req.body.item_name_ar || blogdata.item_name_ar;
            blogdata.unit = req.body.unit || blogdata.unit;
            blogdata.type = req.body.type || blogdata.type;
            blogdata.type_ar = req.body.type_ar || blogdata.type_ar;
            blogdata.rate = req.body.rate || blogdata.rate;
            blogdata.quantity = req.body.quantity || blogdata.quantity;
            blogdata.created_by = req.body.created_by || blogdata.created_by;
            blogdata.status = req.body.status || blogdata.status;
            blogdata
              .save({ new: true })
              .then((result) => {
                Materiallist.findOne({
                  item_id: req.body.item_id,
                })
                  .exec()
                  .then((resp) => {
                    resolve(resObj.user_operation_responses("Updated", resp));
                  })
                  .catch((error) => {
                    console.log(error);
                    resolve(resObj.content_operation_responses("Error", error));
                  });
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_materiallist = function (id) {
  return new Promise(function (resolve, reject) {
    Materiallist.findOne({ item_id: id })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//*****************************************projectplan****************************************************************

module.exports.search_projectplan = function (projectplan_name) {
  return new Promise(function (resolve, reject) {
    Projectplan.find({ projectplan_name: projectplan_name })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_projectplan = function (req, res) {
  return new Promise(function (resolve, reject) {
    let details = req.body.details;
    Projectplan.find(details)
      .populate("projectplan_contracts")
      .populate("projectplan_quotes")
      .populate({
        path: "projectplan_quotes",
        populate: { path: "request_sendto", model: "business_users" },
      })
      .populate("created_by")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        // console.log(resp);
        if (resp.length > 0) {
          this.getquotesdata(resp).then((respArr) => {
            resolve(resObj.user_operation_responses("Fetch", respArr));
          });
          //resolve(resObj.content_operation_responses("Fetch", resp))
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_projectplan = function (req, res) {
  return new Promise(function (resolve, reject) {
    let projectplanID = uniqid();
    Projectplan.create({
      projectplan_id: projectplanID,
      projectplan_name: req.body.projectplan_name,
      projectplan_name_ar: req.body.projectplan_name_ar,
      projectplan_contracts: req.body.projectplan_contracts,
      projectplan_quotes: req.body.projectplan_quotes,
      created_by: req.body.created_by,
      status: req.body.status,
    })
      .then((Blog) => {
        resolve(resObj.content_operation_responses("Created", Blog));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_projectplan = function (req, res) {
  return new Promise(function (resolve, reject) {
    Projectplan.findOne(
      { projectplan_id: req.body.projectplan_id },
      function (err, blogdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (blogdata) {
            blogdata.projectplan_name =
              req.body.projectplan_name || blogdata.projectplan_name;
            blogdata.projectplan_name_ar =
              req.body.projectplan_name_ar || blogdata.projectplan_name_ar;
            blogdata.projectplan_contracts =
              req.body.projectplan_contracts || blogdata.projectplan_contracts;
            blogdata.projectplan_quotes =
              req.body.projectplan_quotes || blogdata.projectplan_quotes;
            blogdata.created_by = req.body.created_by || blogdata.created_by;
            blogdata.status = req.body.status || blogdata.status;
            blogdata
              .save({ new: true })
              .then((result) => {
                Projectplan.findOne({
                  projectplan_id: req.body.projectplan_id,
                })
                  .exec()
                  .then((resp) => {
                    resolve(resObj.user_operation_responses("Updated", resp));
                  })
                  .catch((error) => {
                    console.log(error);
                    resolve(resObj.content_operation_responses("Error", error));
                  });
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_projectplan = function (id) {
  return new Promise(function (resolve, reject) {
    Projectplan.find({ projectplan_id: id })
      .exec()
      .then((result) => {
        //console.log(result);
        if (result.length > 0) {
          console.log(result);
          Contract.deleteMany({ projectplan_id: result[0]._id }).then((res) => {
            console.log(res);
          });
          Quote.deleteMany({ projectplan_id: result[0]._id }).then((res) => {
            console.log(res);
          });
          Quotesubmission.deleteMany({
            projectplan_id: result[0]._id,
          }).then((res) => {
            console.log(res);
          });
          Projectplan.findOne({ projectplan_id: id })
            .deleteOne()
            .then((res) => {
              console.log(res);
              resolve(
                resObj.content_operation_responses("DeleteContent", result)
              );
            });
        } else {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

getquotesdata = function (data) {
  let planArr = [];
  //let resArr=[];
  return new Promise(function (resolve, reject) {
    return Promise.each(data, function (plaVal) {
      let resArr = [];
      if (plaVal.projectplan_quotes.length > 0) {
        return Promise.each(plaVal.projectplan_quotes, function (usrVal) {
          return (
            Quotesubmission.find({
              _id: usrVal.selectedsubmission,
            })
              .populate("materiallist_id")
              .populate("projectplan_id")
              .populate("created_by")
              .populate("selectedsubmission")
              .populate("selectedsubmission.created_by")
              .sort({ updated_at: -1 })
              //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
              .exec()
              .then((resp) => {
                var r = usrVal.toObject();
                if (resp.length > 0) {
                  r.selectedsubmission = resp[0];
                } else {
                  r.selectedsubmission = [];
                }
                resArr.push(r);
              })
          );
        }).then(function (result) {
          //console.log(resArr);
          if (resArr.length > 0) {
            //console.log("Touched here");
            var p = plaVal.toObject();
            p.projectplan_quotes = resArr;
            planArr.push(p);
            //resolve(resObj.user_operation_responses("DistanceFilter", resArr))
          }
          // else{
          // //resolve(resObj.user_operation_responses("Unavailable", "NA"))
          // }
        });
      } else {
        planArr.push(plaVal);
      }
    }).then(function (result) {
      //console.log(resArr);
      if (planArr.length > 0) {
        //console.log("Touched here");
        resolve(planArr);
        //resolve(resObj.user_operation_responses("DistanceFilter", resArr))
      } else {
        resolve(data);
      }
    });
  });
};

//*****************************************contract****************************************************************

module.exports.search_contract = function (item_name, projectplan_id) {
  return new Promise(function (resolve, reject) {
    Contract.find({ item_name: item_name, projectplan_id: projectplan_id })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_contract = function (req, res) {
  return new Promise(function (resolve, reject) {
    let details = req.body.details;
    Contract.find(details)
      .populate("materiallist_id")
      .populate("projectplan_id")
      .populate("created_by")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_contract = function (req, res) {
  return new Promise(function (resolve, reject) {
    let contractID = uniqid();
    Contract.create({
      contract_id: contractID,
      materiallist_id: req.body.materiallist_id,
      projectplan_id: req.body.projectplan_id,
      item_name: req.body.item_name,
      item_name_ar: req.body.item_name_ar,
      unit: req.body.unit,
      type: req.body.type,
      rate: req.body.rate,
      quantity: req.body.quantity,
      total: req.body.total,
      remark: req.body.remark,
      created_by: req.body.created_by,
      status: req.body.status,
    })
      .then((Blog) => {
        resolve(resObj.content_operation_responses("Created", Blog));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_contract = function (req, res) {
  return new Promise(function (resolve, reject) {
    Contract.findOne(
      { contract_id: req.body.contract_id },
      function (err, blogdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (blogdata) {
            blogdata.materiallist_id =
              req.body.materiallist_id || blogdata.materiallist_id;
            blogdata.projectplan_id =
              req.body.projectplan_id || blogdata.projectplan_id;
            blogdata.item_name = req.body.item_name || blogdata.item_name;
            blogdata.item_name_ar =
              req.body.item_name_ar || blogdata.item_name_ar;
            blogdata.unit = req.body.unit || blogdata.unit;
            blogdata.type = req.body.type || blogdata.type;
            blogdata.rate = req.body.rate || blogdata.rate;
            blogdata.quantity = req.body.quantity || blogdata.quantity;
            blogdata.total = req.body.total || blogdata.total;
            blogdata.remark = req.body.remark || blogdata.remark;
            blogdata.created_by = req.body.created_by || blogdata.created_by;
            blogdata.status = req.body.status || blogdata.status;
            blogdata
              .save({ new: true })
              .then((result) => {
                Contract.findOne({
                  contract_id: req.body.contract_id,
                })
                  .exec()
                  .then((resp) => {
                    resolve(resObj.user_operation_responses("Updated", resp));
                  })
                  .catch((error) => {
                    console.log(error);
                    resolve(resObj.content_operation_responses("Error", error));
                  });
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_contract = function (id) {
  return new Promise(function (resolve, reject) {
    Contract.findOne({ contract_id: id })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.delete_all_contractbyproject_id = function (id) {
  return new Promise(function (resolve, reject) {
    Contract.findOne({ projectplan_id: id })
      .deleteMany()
      .then((result) => {
        if (result.acknowledged === true) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
//*****************************************quote****************************************************************

module.exports.search_quote = function (item_name, projectplan_id) {
  return new Promise(function (resolve, reject) {
    Quote.find({ item_name: item_name, projectplan_id: projectplan_id })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_quote = function (req, res) {
  return new Promise(function (resolve, reject) {
    let details = req.body.details;
    Quote.find(details)
      .populate("business_subcategory_id")
      .populate("projectplan_id")
      .populate("created_by")
      .populate("selectedsubmission")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length > 0) {
          if (details.request_sendto) {
            this.getquotesubmission(resp, req.body.created_by).then(
              (respArr) => {
                resolve(resObj.user_operation_responses("Fetch", respArr));
              }
            );
          } else {
            resolve(resObj.content_operation_responses("Fetch", resp));
          }
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

getquotesubmission = function (data, created_by) {
  let resArr = [];
  return new Promise(function (resolve, reject) {
    return Promise.each(data, function (usrVal) {
      return (
        Quotesubmission.find({
          quote_id: usrVal._id,
          created_by: created_by,
        })
          .populate("materiallist_id")
          .populate("projectplan_id")
          .populate("created_by")
          .sort({ updated_at: -1 })
          //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
          .exec()
          .then((resp) => {
            var r = usrVal.toObject();
            if (resp.length > 0) {
              r.response = resp[0];
            } else {
              r.response = {};
            }
            resArr.push(r);
          })
      );
    }).then(function (result) {
      //console.log(resArr);
      if (resArr.length > 0) {
        //console.log("Touched here");
        resolve(resArr);
        //resolve(resObj.user_operation_responses("DistanceFilter", resArr))
      }
      // else{
      // //resolve(resObj.user_operation_responses("Unavailable", "NA"))
      // }
    });
  });
};

module.exports.create_quote = function (req, res) {
  return new Promise(function (resolve, reject) {
    let quoteID = uniqid();
    let businessOid = [];
    // Get the business that deal in this quote
    // BusinessUser.find({deals_in: {$in:req.body.item_name}, user_status : "approved"},{user_password : 0})
    // .exec()
    // .then((resp) => {
    //     console.log(resp);
    //     if(resp.length>0) {
    //         businessOid =  _.map(resp, users => (users._id));
    //         let  i = businessOid.indexOf(req.body.created_by);
    //         if(i >= 0) {
    //             businessOid.splice(i,1);
    //         }

    //             Quote.create({
    //                 quote_id : quoteID,
    //                 materiallist_id : req.body.materiallist_id,
    //                 business_subcategory_id : req.body.business_subcategory_id,
    //                 projectplan_id : req.body.projectplan_id,
    //                 item_name : req.body.item_name,
    //                 item_name_ar : req.body.item_name_ar,
    //                 unit : req.body.unit,
    //                 type : req.body.type,
    //                 type_ar: req.body.type_ar,
    //                 rate : req.body.rate,
    //                 quantity : req.body.quantity,
    //                 total : req.body.total,
    //                 remark : req.body.remark,
    //                 business_remark : req.body.business_remark,
    //                 business_attachments : req.body.business_attachments,
    //                 request_sendto : businessOid,
    //                 created_by : req.body.created_by,
    //                 selectedsubmission:req.body.selectedsubmission,
    //                 status: req.body.status,
    //                 }).then((Blog) => {
    //                     for (var j = 0; j < resp.length; j++) {
    //                         if(req.body.lang=='arabic'){
    //                             req.body.email=resp[j].user_email;
    //                             req.body._id=resp[j]._id;
    //                             req.body.subject_body="لقد تلقيت طلب عرض أسعار جديد.";
    //                             req.body.user_name=resp[j].user_name;
    //                             req.body.type="newquotationrequest_ar";
    //                             Notification.send_mail(req,res);

    //                         }else{
    //                             req.body.email=resp[j].user_email;
    //                             req.body._id=resp[j]._id;
    //                             req.body.subject_body="You have received a new quotation request";
    //                             req.body.user_name=resp[j].user_name;
    //                             req.body.type="newquotationrequest";
    //                             Notification.send_mail(req,res);
    //                         }

    //                     }
    //                resolve(resObj.content_operation_responses("Created", Blog))
    //            }).catch((error) => {
    //             console.log(error)
    //             resolve(resObj.content_operation_responses("Error", error))
    //         });
    //     }else{

    Quote.create({
      quote_id: quoteID,
      materiallist_id: req.body.materiallist_id,
      business_subcategory_id: req.body.business_subcategory_id,
      projectplan_id: req.body.projectplan_id,
      item_name: req.body.item_name,
      item_name_ar: req.body.item_name_ar,
      unit: req.body.unit,
      type: req.body.type,
      rate: req.body.rate,
      quantity: req.body.quantity,
      total: req.body.total,
      remark: req.body.remark,
      business_remark: req.body.business_remark,
      business_attachments: req.body.business_attachments,
      request_sendto: req.body.request_sendto,
      created_by: req.body.created_by,
      selectedsubmission: req.body.selectedsubmission,
      status: req.body.status,
    })
      .then((Blog) => {
        resolve(resObj.content_operation_responses("Created", Blog));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });

    // }
    // })
  });
};

module.exports.update_quote = function (req, res) {
  return new Promise(function (resolve, reject) {
    Quote.findOne({ quote_id: req.body.quote_id }, function (err, blogdata) {
      if (err) {
        //console.log(err);
        resolve(resObj.content_operation_responses("Error", err));
      } else {
        if (blogdata) {
          blogdata.materiallist_id =
            req.body.materiallist_id || blogdata.materiallist_id;
          blogdata.projectplan_id =
            req.body.projectplan_id || blogdata.projectplan_id;
          blogdata.item_name = req.body.item_name || blogdata.item_name;
          blogdata.item_name_ar =
            req.body.item_name_ar || blogdata.item_name_ar;
          blogdata.unit = req.body.unit || blogdata.unit;
          blogdata.type = req.body.type || blogdata.type;
          blogdata.type_ar = req.body.type_ar || blogdata.type_ar;
          blogdata.rate = req.body.rate || blogdata.rate;
          blogdata.quantity = req.body.quantity || blogdata.quantity;
          blogdata.total = req.body.total || blogdata.total;
          blogdata.remark = req.body.remark || blogdata.remark;
          blogdata.business_remark =
            req.body.business_remark || blogdata.business_remark;
          blogdata.business_attachments =
            req.body.business_attachments || blogdata.business_attachments;
          blogdata.request_sendto =
            req.body.request_sendto || blogdata.request_sendto;
          blogdata.created_by = req.body.created_by || blogdata.created_by;
          blogdata.selectedsubmission =
            req.body.selectedsubmission || blogdata.selectedsubmission;
          blogdata.status = req.body.status || blogdata.status;
          blogdata
            .save({ new: true })
            .then((result) => {
              // Sending RFQ to businesses
              if (req.body.request_sendto) {
                BusinessUser.find({
                  _id: req.body.request_sendto,
                }).then((resp) => {
                  console.log("Sending RFQ to businesses");
                  // console.log(resp);
                  for (var j = 0; j < resp.length; j++) {
                    if (req.body.lang == "arabic") {
                      req.body.email = resp[j].user_email;
                      req.body._id = resp[j]._id;
                      req.body.subject_body = "لقد تلقيت طلب عرض أسعار جديد.";
                      req.body.user_name = resp[j].user_name;
                      req.body.type = "newquotationrequest_ar";
                      Notification.send_mail(req, res);
                    } else {
                      req.body.email = resp[j].user_email;
                      req.body._id = resp[j]._id;
                      req.body.subject_body =
                        "You have received a new quotation request";
                      req.body.user_name = resp[j].user_name;
                      req.body.type = "newquotationrequest";
                      Notification.send_mail(req, res);
                    }
                  }
                });
              }

              Quote.findOne({ quote_id: req.body.quote_id })
                .exec()
                .then((resp) => {
                  resolve(resObj.user_operation_responses("Updated", resp));
                })
                .catch((error) => {
                  console.log(error);
                  resolve(resObj.content_operation_responses("Error", error));
                });
            })
            .catch((error) => {
              console.log(error);
              resolve(resObj.content_operation_responses("Error", error));
            });
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "error"));
        }
      }
    });
  });
};

module.exports.delete_quote = function (id) {
  return new Promise(function (resolve, reject) {
    Quote.findOne({ quote_id: id })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
//***************************************** quotesubmission ****************************************************************

module.exports.search_quotesubmission = function (
  quote_id,
  projectplan_id,
  created_by
) {
  return new Promise(function (resolve, reject) {
    Quotesubmission.find({
      quote_id: quote_id,
      projectplan_id: projectplan_id,
      created_by: created_by,
    })
      .exec()
      .then((resp) => {
        console.log(resp);
        if (resp.length === 0) {
          resolve("Allowed");
        } else {
          resolve("Exists");
        }
      })
      .catch((error) => {
        resolve("Try again");
      });
  });
};

module.exports.read_quotesubmission = function (req, res) {
  return new Promise(function (resolve, reject) {
    let details = req.body.details;
    Quotesubmission.find(details)
      .populate("materiallist_id")
      .populate("projectplan_id")
      .populate("created_by")
      .populate("quote_id")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.create_quotesubmission = function (req, res) {
  return new Promise(function (resolve, reject) {
    let quotesubmissionID = uniqid();
    Quotesubmission.create({
      quotesubmission_id: quotesubmissionID,
      quote_id: req.body.quote_id,
      projectplan_id: req.body.projectplan_id,
      price: req.body.price,
      remark: req.body.remark,
      attachments: req.body.attachments,
      created_by: req.body.created_by,
      status: req.body.status,
    })
      .then((Blog) => {
        resolve(resObj.content_operation_responses("Created", Blog));
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.update_quotesubmission = function (req, res) {
  return new Promise(function (resolve, reject) {
    Quotesubmission.findOne(
      { quotesubmission_id: req.body.quotesubmission_id },
      function (err, blogdata) {
        if (err) {
          //console.log(err);
          resolve(resObj.content_operation_responses("Error", err));
        } else {
          if (blogdata) {
            blogdata.quote_id = req.body.quote_id || blogdata.quote_id;
            blogdata.projectplan_id =
              req.body.projectplan_id || blogdata.projectplan_id;
            blogdata.price = req.body.price || blogdata.price;
            blogdata.remark = req.body.remark || blogdata.remark;
            blogdata.attachments = req.body.attachments || blogdata.attachments;
            blogdata.created_by = req.body.created_by || blogdata.created_by;
            blogdata.status = req.body.status || blogdata.status;
            blogdata
              .save({ new: true })
              .then((result) => {
                Quotesubmission.findOne({
                  quotesubmission_id: req.body.quotesubmission_id,
                })
                  .exec()
                  .then((resp) => {
                    resolve(resObj.user_operation_responses("Updated", resp));
                  })
                  .catch((error) => {
                    console.log(error);
                    resolve(resObj.content_operation_responses("Error", error));
                  });
              })
              .catch((error) => {
                console.log(error);
                resolve(resObj.content_operation_responses("Error", error));
              });
          } else {
            resolve(resObj.content_operation_responses("Unavailable", "error"));
          }
        }
      }
    );
  });
};

module.exports.delete_quotesubmission = function (id) {
  return new Promise(function (resolve, reject) {
    Quotesubmission.findOne({ quotesubmission_id: id })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

//***************************************** quote report ****************************************************************

module.exports.numberOfQuotationEequestsCreatedToday = function (req, res) {
  return new Promise(function (resolve, reject) {
    // let date=new Date();
    // date.setHours(0,0,0,0);
    Quote.find({
      $where: function () {
        today = new Date(); //
        today.setHours(0, 0, 0, 0);
        return this._id.getTimestamp() >= today;
      },
    })
      .populate("materiallist_id")
      .populate("projectplan_id")
      .populate("created_by")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.numberOfRequestsTillDate = function (req, res) {
  return new Promise(function (resolve, reject) {
    Quote.find()
      .populate("materiallist_id")
      .populate("projectplan_id")
      .populate("created_by")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.numberOfQuotationsSentToRequestsByBusinessesToday = function (
  req,
  res
) {
  return new Promise(function (resolve, reject) {
    // let date=new Date();
    // date.setHours(0,0,0,0);
    Quotesubmission.find({
      $where: function () {
        today = new Date(); //
        today.setHours(0, 0, 0, 0);
        return this._id.getTimestamp() >= today;
      },
    })
      .populate("materiallist_id")
      .populate("projectplan_id")
      .populate("created_by")
      .populate("quote_id")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.numberOfQuotationsSentToRequestsByBusinessesTillDate = function (
  req,
  res
) {
  return new Promise(function (resolve, reject) {
    Quotesubmission.find()
      .populate("materiallist_id")
      .populate("projectplan_id")
      .populate("created_by")
      .populate("quote_id")
      .sort({ updated_at: -1 })
      //.skip(parseInt(req.body.offset)*ConstantCtrl.limit).limit(ConstantCtrl.limit)
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", "NA"));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
//  hashtag.
module.exports.search_hashtag = function (hashtag_text) {
  return new Promise(function (resolve, reject) {
    Hashtag.findOne({ hashtag_text: hashtag_text })
      .exec()
      .then((resp) => {
        if (resp) {
          resolve("Exists");
        } else {
          resolve("Allowed");
        }
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

module.exports.create_hashtag = function (req, res) {
  return new Promise(function (resolve, reject) {
    let hashtagID = uniqid();
    Hashtag.create({
      hashtag_id: hashtagID,
      hashtag_text: req.body.hashtag_text.toLowerCase().trim(),
      status: "approved",
    })
      .then((Hashtag) => {
        resolve(resObj.content_operation_responses("Created", Hashtag));
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.increment_hashtag = function (hashtag_text) {
  return new Promise(function (resolve, reject) {
    Hashtag.findOneAndUpdate(
      { hashtag_text: hashtag_text },
      { $inc: { usage_count: 1 }, updated_at: Date.now() },
      { new: true }
    )
      .then((hashtag) => {
        resolve(resObj.content_operation_responses("Updated", hashtag));
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.read_hashtag_all = function (daysOld) {
  return new Promise(function (resolve, reject) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    Hashtag.find({
      created_at: { $gte: cutoffDate },
    })
      .sort({ created_at: -1 })
      .exec()
      .then((resp) => {
        resolve(resObj.content_operation_responses("Fetch", resp));
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.delete_hashtag = function (req, res) {
  return new Promise(function (resolve, reject) {
    Hashtag.findOne({ hashtag_id: req.body.hashtag_id })
      .deleteOne()
      .then((result) => {
        if (result.n === 0) {
          resolve(
            resObj.content_operation_responses("DeleteContentError", result)
          );
        } else {
          resolve(resObj.content_operation_responses("DeleteContent", result));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
module.exports.update_inventory_tag = function (optype, item_tags, item_id) {
  return new Promise(function (resolve, reject) {
    if (optype === "Add") {
      module.exports
        .processHashtags(item_tags)
        .then(() => {
          // Continue with the existing functionality
          Inventory.findOneAndUpdate(
            { item_id: item_id },
            { $set: { item_tags: item_tags } },
            { new: true }
          )
            .populate("item_category")
            .populate("item_subcategory")
            .populate("created_by", { user_password: 0 })
            .exec()
            .then((resp_data) => {
              resolve(resp_data);
            })
            .catch((error) => {
              console.log(error);
              resolve(error);
            });
        })
        .catch((error) => {
          console.log("Error processing hashtags:", error);
          resolve(error);
        });
    } else if (optype === "Remove") {
      // Existing code for Remove operation
      Inventory.findOneAndUpdate(
        { item_id: item_id },
        { $pull: { item_tags: item_tags } },
        { new: true }
      )
        .populate("item_category")
        .populate("item_subcategory")
        .populate("created_by", { user_password: 0 })
        .exec()
        .then((resp_data) => {
          resolve(resp_data);
        })
        .catch((error) => {
          console.log(error);
          resolve(error);
        });
    }
  });
};

/**
 * Process hashtags from an inventory item
 * Creates or increments hashtags in the database
 */
module.exports.processHashtags = function (hashtags, businessId = null) {
  return new Promise(function (resolve, reject) {
    if (!hashtags || !Array.isArray(hashtags) || hashtags.length === 0) {
      resolve([]);
      return;
    }
    const processedTags = [];
    const promises = [];

    hashtags.forEach((tag) => {
      const cleanTag = tag.toLowerCase().trim();
      if (cleanTag) {
        processedTags.push(cleanTag);

        // Check if the hashtag exists
        const promise = module.exports.search_hashtag(cleanTag).then((resp) => {
          if (resp === "Exists") {
            // Increment existing hashtag
            return module.exports.increment_hashtag(cleanTag);
          } else if (resp === "Allowed") {
            // Create new hashtag
            const req = {
              body: {
                hashtag_text: cleanTag,
                business_id: businessId,
              },
            };
            return module.exports.create_hashtag(req);
          }
        });

        promises.push(promise);
      }
    });

    // Wait for all hashtag operations to complete
    Promise.all(promises)
      .then(() => {
        resolve(processedTags);
      })
      .catch((error) => {
        console.error("Error processing hashtags:", error);
        resolve(processedTags); // Still return processed tags even if there were errors
      });
  });
};

/**
 * Search hashtags by query string (for autocomplete)
 * Only returns global hashtags (no business_id) for recommendations
 */
module.exports.search_hashtags = function (query) {
  return new Promise(function (resolve, reject) {
    Hashtag.find({
      hashtag_text: { $regex: query, $options: "i" },
      status: "approved",
      business_id: null, // Only return global hashtags
    })
      .sort({ usage_count: -1 }) // Sort by most used first
      .limit(10) // Limit to 10 results for autocomplete
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", []));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
/**
 * Update hashtag status (approved/hidden)
 */
module.exports.update_hashtag_status = function (hashtag_id, status) {
  return new Promise(function (resolve, reject) {
    Hashtag.findOneAndUpdate(
      { hashtag_id: hashtag_id },
      {
        status: status,
        updated_at: Date.now(),
      },
      { new: true }
    )
      .then((hashtag) => {
        if (hashtag) {
          resolve(resObj.content_operation_responses("Updated", hashtag));
        } else {
          resolve(
            resObj.content_operation_responses(
              "Unavailable",
              "Hashtag not found"
            )
          );
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};
/**
 * Add hashtag to a business
 * Checks if the business has reached its hashtag limit
 * If not, associates the hashtag with the business
 */
module.exports.add_business_hashtag = function (req, res) {
  return new Promise(function (resolve, reject) {
    const businessId = req.body.business_id;
    const hashtagText = req.body.hashtag_text.toLowerCase().trim();
    console.log("Adding hashtag to business:", businessId, hashtagText);

    // 1. check if business has reached its hashtag limit (count all hashtags, not just approved)
    BusinessUser.findOne({ user_id: businessId })
      .then((business) => {
        if (!business) {
          resolve(
            resObj.content_operation_responses(
              "Unavailable",
              "Business not found"
            )
          );
          return;
        }
        // Count all hashtags for this business (any status)
        return module.exports
          .count_all_business_hashtags(businessId)
          .then((hashtagCount) => {
            const maxHashtags = business.max_hashtags;
            console.log(
              "Current hashtags:",
              hashtagCount,
              "Max allowed:",
              maxHashtags
            );
            if (hashtagCount >= maxHashtags) {
              resolve({
                success: false,
                error: "Hashtag limit reached",
                limit: maxHashtags,
              });
              return null;
            }
            // Check if hashtag exists
            return module.exports.search_hashtag(hashtagText).then((resp) => {
              if (resp === "Exists") {
                // Hashtag exists, associate it with business
                return Hashtag.findOneAndUpdate(
                  { hashtag_text: hashtagText },
                  {
                    $inc: { usage_count: 1 },
                    business_id: businessId,
                    updated_at: Date.now(),
                  },
                  { new: true }
                );
              } else if (resp === "Allowed") {
                // Create new hashtag with business_id
                let hashtagID = uniqid();
                return Hashtag.create({
                  hashtag_id: hashtagID,
                  hashtag_text: hashtagText,
                  business_id: businessId,
                  status: "approved",
                });
              }
            });
          });
      })
      .then((hashtag) => {
        if (hashtag) {
          resolve(resObj.content_operation_responses("Created", hashtag));
        }
      })
      .catch((error) => {
        console.error("Error adding business hashtag:", error);
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

module.exports.get_business_hashtags = function (businessId) {
  return new Promise(function (resolve, reject) {
    Hashtag.find({
      business_id: businessId,
      status: "approved",
    })
      .sort({ created_at: -1 })
      .exec()
      .then((resp) => {
        if (resp.length > 0) {
          resolve(resObj.content_operation_responses("Fetch", resp));
        } else {
          resolve(resObj.content_operation_responses("Unavailable", []));
        }
      })
      .catch((error) => {
        resolve(resObj.content_operation_responses("Error", error));
      });
  });
};

/**
 * Update the maximum hashtag limit for a business
 */
module.exports.update_business_hashtag_limit = function (req, res) {
  return new Promise(function (resolve, reject) {
    const businessId = req.body.business_id;
    const newLimit = req.body.max_hashtags;

    if (!businessId || !newLimit || isNaN(newLimit) || newLimit < 0) {
      resolve(
        resObj.content_operation_responses(
          "InvalidInput",
          "Business ID and positive max_hashtags value are required"
        )
      );
      return;
    }

    // Use findOne first to verify the business exists
    BusinessUser.findOne({ user_id: businessId })
      .then((business) => {
        if (!business) {
          resolve(
            resObj.content_operation_responses(
              "Unavailable",
              "Business not found"
            )
          );
          return;
        }

        // Then update the max_hashtags field
        return BusinessUser.findOneAndUpdate(
          { user_id: businessId },
          { max_hashtags: newLimit },
          { new: true }
        );
      })
      .then((business) => {
        if (business) {
          resolve(
            resObj.content_operation_responses("Updated", {
              business_id: businessId,
              max_hashtags: newLimit,
            })
          );
        }
      })
      .catch((error) => {
        console.error("Error updating business hashtag limit:", error);
        resolve(
          resObj.content_operation_responses("Error", error.message || error)
        );
      });
  });
};
