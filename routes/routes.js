let express = require("express");
let app = require("../app");
let router = express.Router();
let path = require("path");
let mime = require("mime");
let fs = require("fs");
let jwt = require("jsonwebtoken");
let mainCtrl = require("../controllers/main_controller");
let checkAuth = require("../middleware/is-auth");
let multer = require("multer");
let Jimp = require("jimp");
let businessUserCtrl = require("../controllers/business_user_controller");
let adminCtrl = require("../controllers/admin_controller");

///////////////File Storage/////////////////////////////////////////////
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./img_directory");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
let upload = multer({ storage: storage });

// s3 buket image upload
const uploads = require("../services/file-upload");

const singleUpload = uploads.single("image");

router.post("/upload_file", upload.single("image"), (req, res) => {
  //console.log(req.file.filename);
  Jimp.read(req.file.path)
    .then((lenna) => {
      console.log(req.file.size);
      if (req.file.size > 250000) {
        lenna.resize(800, Jimp.AUTO).quality(85).write(req.file.path);
      } else {
        lenna.write(req.file.path);
      }
    })
    .then((val) => {
      res.send({ success: true, path: req.file.path });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.post("/image-upload", function (req, res) {
  singleUpload(req, res, function (err) {
    if (err) {
      console.log(err.message);
      return res.status(422).send({
        errors: [{ title: "File Upload Error", detail: err.message }],
      });
    }

    return res.json({ imageUrl: req.file.location });
  });
});
// end s3 bucket image upload

////////////////////Business Category///////////////////////////////////zz
router.post("/create_business_category", (req, res) => {
  console.log("Hit route");
  mainCtrl.create_business_category(req, res);
});
router.post("/read_business_category", (req, res) => {
  mainCtrl.read_business_category(req, res);
});
router.post("/read_business_category_admin", (req, res) => {
  mainCtrl.read_business_category_admin(req, res);
});
router.post("/update_business_category", (req, res) => {
  mainCtrl.update_business_category(req, res);
});
router.post("/delete_business_category", (req, res) => {
  mainCtrl.delete_business_category(req, res);
});

////////////////////Inventory Category///////////////////////////////////
router.post("/create_inventory_category", (req, res) => {
  console.log("Hit route");
  mainCtrl.create_inventory_category(req, res);
});
router.post("/read_inventory_category", (req, res) => {
  mainCtrl.read_inventory_category(req, res);
});
router.post("/read_inventory_category_admin", (req, res) => {
  mainCtrl.read_inventory_category_admin(req, res);
});
router.post("/update_inventory_category", (req, res) => {
  mainCtrl.update_inventory_category(req, res);
});
router.post("/delete_inventory_category", (req, res) => {
  mainCtrl.delete_inventory_category(req, res);
});

// ///////////////////Business SubCategory////////////////////////////////
router.post("/create_business_subcategory", (req, res) => {
  // console.log("Here");

  mainCtrl.create_business_subcategory(req, res);
});
router.post("/read_business_subcategory", (req, res) => {
  mainCtrl.read_business_subcategory(req, res);
});
router.post("/read_business_subcategory_admin", (req, res) => {
  mainCtrl.read_business_subcategory_admin(req, res);
});
router.post("/update_business_subcategory", (req, res) => {
  mainCtrl.update_business_subcategory(req, res);
});
router.post("/delete_business_subcategory", (req, res) => {
  mainCtrl.delete_business_subcategory(req, res);
});

router.post("/get_business_category_by_id", (req, res) => {
  mainCtrl.get_business_category_by_id(req, res);
});

// ///////////////////Inventory SubCategory////////////////////////////////
router.post("/create_inventory_subcategory", (req, res) => {
  // console.log("Here");

  mainCtrl.create_inventory_subcategory(req, res);
});
router.post("/read_inventory_subcategory", (req, res) => {
  mainCtrl.read_inventory_subcategory(req, res);
});
router.post("/read_inventory_subcategory_admin", (req, res) => {
  mainCtrl.read_inventory_subcategory_admin(req, res);
});
router.post("/update_inventory_subcategory", (req, res) => {
  mainCtrl.update_inventory_subcategory(req, res);
});
router.post("/delete_inventory_subcategory", (req, res) => {
  mainCtrl.delete_inventory_subcategory(req, res);
});
router.post("/search_inventory_related", (req, res) => {
  mainCtrl.search_inventory_related(req, res);
});

// //////////////////Business User///////////////////////////////////////
router.post("/register_business", (req, res) => {
  if (!req.body.user_public_name)
    req.body.user_public_name = req.body.user_name;

  console.log("Registering business user", req.body);
  mainCtrl.create_business_user(req, res);
});

router.post("/refresh_login_with_token", checkAuth, (req, res) => {
  mainCtrl.refresh_login_with_token(req, res);
});

// Create route ofr bulk uplaod function
router.post("/create_bulk_users", (req, res) => {
  mainCtrl.create_bulk_users(req, res);
});

router.post("/resend_account_verification", (req, res) => {
  mainCtrl.resend_account_verification(req, res);
});

router.post("/resend_otp", (req, res) => {
  mainCtrl.resend_account_verification(req, res);
});

router.post("/send_otp_verification", (req, res) => {
  mainCtrl.send_otp_verification(req, res);
});

router.post("/verify_otp", (req, res) => {
  mainCtrl.verify_otp(req, res);
});

router.post("/verify_account", (req, res) => {
  mainCtrl.verify_account(req, res);
});

router.post("/is_account_verified", (req, res) => {
  mainCtrl.is_account_verified(req, res);
});

router.post("/read_business", (req, res) => {
  mainCtrl.read_business_user(req, res);
});

router.post("/get_suggested_businesses", (req, res) => {
  mainCtrl.get_suggested_businesses(req, res);
});

router.post("/search_business_user_name", checkAuth, (req, res) => {
  mainCtrl.search_business_user_name(req, res);
});

router.post("/read_user_details", checkAuth, (req, res) => {
  mainCtrl.read_user_details(req, res);
});

router.post("/read_business_by_id", (req, res) => {
  mainCtrl.read_business_user_by_id(req, res);
});

router.post("/read_business_by_name", (req, res) => {
  mainCtrl.read_business_user_by_id(req, res);
});

router.post("/send_business_claim_email", (req, res) => {
  businessUserCtrl.send_business_claim_email(req, res);
});
router.post("/verify_claim_token", (req, res) => {
  businessUserCtrl.verify_claim_token(req, res);
});

router.post("/claim_set_password", businessUserCtrl.claim_set_password);

router.post("/read_business_by_oid", (req, res) => {
  mainCtrl.read_business_user_by_oid(req, res);
});

router.post("/read_user_by_timeline", (req, res) => {
  mainCtrl.read_user_by_timeline(req, res);
});
router.post("/read_business_user_by_timeline", (req, res) => {
  mainCtrl.read_business_user_by_timeline(req, res);
});

router.post("/read_business_public", (req, res) => {
  mainCtrl.read_business_user_public(req, res);
});

router.post("/follow_user", (req, res) => {
  mainCtrl.follow_user(req, res);
});
router.post("/unfollow_user", (req, res) => {
  mainCtrl.unfollow_user(req, res);
});
router.post("/user_followers", (req, res) => {
  mainCtrl.user_followers(req, res);
});
router.post("/user_following", (req, res) => {
  mainCtrl.user_following(req, res);
});

router.post("/read_business_reviews", (req, res) => {
  mainCtrl.read_business_reviews(req, res);
});

router.post("/search_general", (req, res) => {
  mainCtrl.search_general(req, res);
});

router.post("/read_business_all", (req, res) => {
  mainCtrl.read_business_user_all(req, res);
});
router.post("/read_businessuser_all", (req, res) => {
  mainCtrl.read_businessuser_all(req, res);
});

router.post("/profile_business", checkAuth, (req, res) => {
  mainCtrl.update_business_user(req, res);
});

router.post("/update_business_user_byId", checkAuth, (req, res) => {
  mainCtrl.update_business_user_byId(req, res);
});

router.post("/get_business_categories_andSubcategories", (req, res) => {
  mainCtrl.get_business_categories_andSubcategories(req, res);
});

router.post("/send_business_claim_email", checkAuth, (req, res) => {
  mainCtrl.send_business_claim_email(req, res);
});

// Branch Management Routes
router.post("/add_branch", checkAuth, (req, res) => {
  businessUserCtrl.add_branch(req, res);
});

router.post("/get_branches", checkAuth, (req, res) => {
  businessUserCtrl.get_branches(req, res);
});

router.post("/get_branch_by_id", checkAuth, (req, res) => {
  businessUserCtrl.get_branch_by_id(req, res);
});

router.post("/update_branch", checkAuth, (req, res) => {
  businessUserCtrl.update_branch(req, res);
});

router.post("/delete_branch", checkAuth, (req, res) => {
  businessUserCtrl.delete_branch(req, res);
});

// router.post('/get_business_details',checkAuth, (req, res) => {
//     mainCtrl.read_business_user(req, res);
// });
router.post("/update_business_profile", checkAuth, (req, res) => {
  mainCtrl.update_business_user(req, res);
});

router.post("/update_business_public", checkAuth, (req, res) => {
  mainCtrl.update_business_public(req, res);
});

router.post("/deletecomment", checkAuth, (req, res) => {
  mainCtrl.deletecomment(req, res);
});
router.post("/delete_business", checkAuth, (req, res) => {
  mainCtrl.delete_business_user(req, res);
});

router.post("/forgotpassword", (req, res) => {
  mainCtrl.forgotpassword(req, res);
});
router.post("/reset_password", (req, res) => {
  mainCtrl.reset_password(req, res);
});
router.post("/changepassword", (req, res) => {
  mainCtrl.changepassword(req, res);
});

// /////////////////Collections/////////////////////////////////////////
router.post("/create_collection", checkAuth, (req, res) => {
  mainCtrl.create_collection(req, res);
});
router.post("/read_collection", checkAuth, (req, res) => {
  mainCtrl.read_collection(req, res);
});

router.post("/read_collection_by_collection_id", checkAuth, (req, res) => {
  mainCtrl.read_collection_by_collection_id(req, res);
});
router.post("/update_collection", checkAuth, (req, res) => {
  mainCtrl.update_collection(req, res);
});
router.post("/delete_collection", checkAuth, (req, res) => {
  mainCtrl.delete_collection(req, res);
});

// /////////////////Projects/////////////////////////////////////////
router.post("/create_project", checkAuth, (req, res) => {
  mainCtrl.create_project(req, res);
});
router.post("/read_project_by_user", (req, res) => {
  mainCtrl.read_project_by_user(req, res);
});
router.post("/read_project_by_id", (req, res) => {
  mainCtrl.read_project_by_id(req, res);
});
router.post("/read_project_all", checkAuth, (req, res) => {
  mainCtrl.read_project_all(req, res);
});
router.post("/update_project", checkAuth, (req, res) => {
  mainCtrl.update_project(req, res);
});
router.post("/move_listing_to_project", checkAuth, (req, res) => {
  mainCtrl.move_listing_to_project(req, res);
});
router.post("/add_listing_to_project", checkAuth, (req, res) => {
  mainCtrl.add_listing_to_project(req, res);
});
router.post("/remove_listing_from_project", checkAuth, (req, res) => {
  mainCtrl.remove_listing_from_project(req, res);
});
router.post("/delete_project", checkAuth, (req, res) => {
  mainCtrl.delete_project(req, res);
});

// /////////////////Inventory/////////////////////////////////////////
router.post("/create_inventory", checkAuth, (req, res) => {
  mainCtrl.create_inventory(req, res);
});
router.post("/read_inventory_by_user", checkAuth, (req, res) => {
  mainCtrl.read_inventory_by_user(req, res);
});
router.post("/read_inventory_by_id", (req, res) => {
  mainCtrl.read_inventory_by_id(req, res);
});
router.post("/read_inventory_all", (req, res) => {
  mainCtrl.read_inventory_all(req, res);
});
router.post("/update_inventory", checkAuth, (req, res) => {
  mainCtrl.update_inventory(req, res);
});
router.post("/update_inventory_public", checkAuth, (req, res) => {
  mainCtrl.update_inventory_public(req, res);
});
router.post("/delete_inventory", checkAuth, (req, res) => {
  mainCtrl.delete_inventory(req, res);
});

// /////////////////Business Filters/////////////////////////////////////////
router.post("/create_business_filter", (req, res) => {
  mainCtrl.create_business_filter(req, res);
});
router.post("/read_business_filter_all", (req, res) => {
  //     // console.log("Here");

  mainCtrl.read_business_filter_all(req, res);
});
router.post("/update_business_filter", (req, res) => {
  mainCtrl.update_business_filter(req, res);
});
router.post("/delete_business_filter", (req, res) => {
  mainCtrl.delete_business_filter(req, res);
});

// /////////////////Inventory Filters/////////////////////////////////////////
router.post("/create_inventory_filter", (req, res) => {
  mainCtrl.create_inventory_filter(req, res);
});
router.post("/read_inventory_filter_all", (req, res) => {
  // console.log("Here");

  mainCtrl.read_inventory_filter_all(req, res);
});
router.post("/update_inventory_filter", (req, res) => {
  mainCtrl.update_inventory_filter(req, res);
});
router.post("/delete_inventory_filter", (req, res) => {
  mainCtrl.delete_inventory_filter(req, res);
});
// ////////////////Products////////////////////////////////////////////
// router.post('/create_product',checkAuth, (req, res) => {
//     mainCtrl.create_product(req, res);
// });
// router.post('/read_product',checkAuth, (req, res) => {
//     mainCtrl.read_product(req, res);
// });
// router.post('/update_product',checkAuth, (req, res) => {
//     mainCtrl.update_product(req, res);
// });
// router.post('/delete_product',checkAuth, (req, res) => {
//     mainCtrl.delete_product(req, res);
// });

// //////////////General User//////////////////////////////////////////
// router.post('/register_user',checkAuth, (req, res) => {
//     mainCtrl.create_user(req, res);
// });
// router.post('/profile_user',checkAuth, (req, res) => {
//     mainCtrl.profile_user(req, res);
// });

// router.post('/get_user_details',checkAuth, (req, res) => {
//     mainCtrl.read_user(req, res);
// });
// router.post('/update_user_profile',checkAuth, (req, res) => {
//     mainCtrl.update_user(req, res);
// });
// router.post('/delete_user',checkAuth, (req, res) => {
//     mainCtrl.delete_user(req, res);
// });

// /////////////Blog//////////////////////////////////////////////////
router.post("/create_blog", (req, res) => {
  mainCtrl.create_blog(req, res);
});
router.post("/read_blog_by_user", (req, res) => {
  mainCtrl.read_blog_by_user(req, res);
});
router.post("/read_blog_by_id", (req, res) => {
  mainCtrl.read_blog_by_id(req, res);
});
router.post("/read_blog_all", (req, res) => {
  mainCtrl.read_blog_all(req, res);
});
router.post("/update_blog", (req, res) => {
  mainCtrl.update_blog(req, res);
});
router.post("/delete_blog", (req, res) => {
  mainCtrl.delete_blog(req, res);
});

//////////////////Notification//////////////////////////////////////////////////
router.post("/push_notification", checkAuth, (req, res) => {
  mainCtrl.send_notification(req, res);
});
router.post("/send_mail", (req, res) => {
  mainCtrl.send_mail(req, res);
});

//////////////////Admin//////////////////////////////////////////////////
router.get("/admin_create", (req, res) => {
  req.body = {
    admin_name: "Said",
    admin_address: "Address",
    admin_email: "hakuan@gmil.com",
    admin_password: "123456",
  };
  mainCtrl.admin_create(req, res);
});
router.post("/admin_create", (req, res) => {
  mainCtrl.admin_create(req, res);
});
router.post("/admin_login", (req, res) => {
  mainCtrl.admin_login(req, res);
});
router.post("/admin_forgotpassword", (req, res) => {
  mainCtrl.admin_forgotpassword(req, res);
});
router.post("/admin_changepassword", (req, res) => {
  mainCtrl.admin_changepassword(req, res);
});
router.post("/admin_update", (req, res) => {
  mainCtrl.admin_update(req, res);
});

router.post("/set_max_hashtag_limit", adminCtrl.set_max_hashtag_limit);
router.get("/get_max_hashtag_limit", adminCtrl.get_max_hashtag_limit);

// ////////////Search/////////////////////////////////////////

router.post("/search_stats", (req, res) => {
  mainCtrl.search_stats(req, res);
  // console.log("API hit");
});

// /////////////////Tags/////////////////////////////////////////
router.post("/create_tag", (req, res) => {
  mainCtrl.create_tag(req, res);
});

router.post("/read_tag_all", (req, res) => {
  // console.log("Here");

  mainCtrl.read_tag_all(req, res);
});
router.post("/update_tag", (req, res) => {
  mainCtrl.update_tag(req, res);
});
router.post("/delete_tag", (req, res) => {
  mainCtrl.delete_tag(req, res);
});
router.post("/read_tag_by_id", (req, res) => {
  mainCtrl.read_tag_by_id(req, res);
});
router.post("/search_tag", (req, res) => {
  mainCtrl.search_tag(req, res);
});
router.post("/get_tags_by_inventory", (req, res) => {
  mainCtrl.get_tags_by_inventory(req, res);
});

router.post("/search_inventory_by_tag", (req, res) => {
  mainCtrl.search_inventory_by_tag(req, res);
});

router.post("/remove_tag_from_inventory", (req, res) => {
  mainCtrl.remove_tag_from_inventory(req, res);
});
// ///////////////////hashtags///////////////////////////////////////
router.post("/create_hashtag", checkAuth, (req, res) => {
  mainCtrl
    .create_hashtag(req, res)
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send({ success: false, error: err }));
});

router.post("/read_hashtag_all", checkAuth, (req, res) => {
  mainCtrl.read_hashtag_all(req, res);
});

router.post("/search_hashtags", (req, res) => {
  mainCtrl.search_hashtags(req, res);
});

router.post("/update_hashtag_status", checkAuth, (req, res) => {
  mainCtrl.update_hashtag_status(req, res);
});

router.post("/delete_hashtag", checkAuth, (req, res) => {
  mainCtrl.delete_hashtag(req, res);
});

router.post("/update_business_hashtag_limit", checkAuth, (req, res) => {
  mainCtrl.update_business_hashtag_limit(req, res);
});

router.post("/get_business_hashtags", checkAuth, (req, res) => {
  mainCtrl.get_business_hashtags(req, res);
});

router.post("/add_business_hashtag", checkAuth, (req, res) => {
  mainCtrl.add_business_hashtag(req, res);
});

// ///////////////////country///////////////////////////////////////
router.post("/create_country", (req, res) => {
  mainCtrl.create_country(req, res);
});
router.post("/read_country", (req, res) => {
  // console.log("Here");

  mainCtrl.read_country(req, res);
});

router.post("/read_business_reviews", (req, res) => {
  mainCtrl.read_business_reviews(req, res);
});

router.post("/update_country", (req, res) => {
  mainCtrl.update_country(req, res);
});
router.post("/delete_country", (req, res) => {
  mainCtrl.delete_country(req, res);
});

// ///////////////////materiallist///////////////////////////////////////
router.post("/create_materiallist", (req, res) => {
  mainCtrl.create_materiallist(req, res);
});
router.post("/read_materiallist", (req, res) => {
  mainCtrl.read_materiallist(req, res);
});
router.post("/read_materiallist_new", (req, res) => {
  mainCtrl.read_materiallist_new(req, res);
});
router.post("/update_materiallist", (req, res) => {
  mainCtrl.update_materiallist(req, res);
});
router.post("/delete_materiallist", (req, res) => {
  mainCtrl.delete_materiallist(req, res);
});

// ///////////////////projectplan///////////////////////////////////////
router.post("/create_projectplan", (req, res) => {
  mainCtrl.create_projectplan(req, res);
});
router.post("/read_projectplan", (req, res) => {
  // console.log("Here");

  mainCtrl.read_projectplan(req, res);
});
router.post("/update_projectplan", (req, res) => {
  mainCtrl.update_projectplan(req, res);
});
router.post("/delete_projectplan", (req, res) => {
  mainCtrl.delete_projectplan(req, res);
});

// ///////////////////contract///////////////////////////////////////
router.post("/create_contract", (req, res) => {
  mainCtrl.create_contract(req, res);
});
router.post("/read_contract", (req, res) => {
  // console.log("Here");

  mainCtrl.read_contract(req, res);
});
router.post("/update_contract", (req, res) => {
  mainCtrl.update_contract(req, res);
});
router.post("/delete_contract", (req, res) => {
  mainCtrl.delete_contract(req, res);
});
router.post("/delete_all_contractbyproject_id", (req, res) => {
  mainCtrl.delete_all_contractbyproject_id(req, res);
});

// ///////////////////quote///////////////////////////////////////
router.post("/create_quote", (req, res) => {
  mainCtrl.create_quote(req, res);
});

router.post("/read_quote", (req, res) => {
  // console.log("Here");

  mainCtrl.read_quote(req, res);
});
router.post("/update_quote", (req, res) => {
  mainCtrl.update_quote(req, res);
});
router.post("/delete_quote", (req, res) => {
  mainCtrl.delete_quote(req, res);
});

// ///////////////////quotesubmission///////////////////////////////////////
router.post("/create_quotesubmission", (req, res) => {
  mainCtrl.create_quotesubmission(req, res);
});
router.post("/read_quotesubmission", (req, res) => {
  // console.log("Here");

  mainCtrl.read_quotesubmission(req, res);
});
router.post("/update_quotesubmission", (req, res) => {
  mainCtrl.update_quotesubmission(req, res);
});
router.post("/delete_quotesubmission", (req, res) => {
  mainCtrl.delete_quotesubmission(req, res);
});

// ///////////////////admin quote report///////////////////////////////////////
router.post("/numberOfQuotationEequestsCreatedToday", (req, res) => {
  mainCtrl.numberOfQuotationEequestsCreatedToday(req, res);
});
router.post("/numberOfRequestsTillDate", (req, res) => {
  // console.log("Here");

  mainCtrl.numberOfRequestsTillDate(req, res);
});
router.post(
  "/numberOfQuotationsSentToRequestsByBusinessesToday",
  (req, res) => {
    mainCtrl.numberOfQuotationsSentToRequestsByBusinessesToday(req, res);
  }
);
router.post(
  "/numberOfQuotationsSentToRequestsByBusinessesTillDate",
  (req, res) => {
    mainCtrl.numberOfQuotationsSentToRequestsByBusinessesTillDate(req, res);
  }
);

router.post("/following_feed", checkAuth, (req, res) => {
  mainCtrl.get_following_feed(req, res);
});

router.post("/check_custom_url", (req, res) => {
  mainCtrl.check_custom_url_availability(req, res);
});

router.post("/update_custom_url", checkAuth, (req, res) => {
  mainCtrl.update_custom_url(req, res);
});

router.get("/business/url/:custom_url", (req, res) => {
  mainCtrl.get_business_by_custom_url(req, res);
});

router.post("/find_user_by_username", (req, res) => {
  mainCtrl.find_user_by_username(req, res);
});
router.get("/new", (req, res) => {
  res.json({ message: "Hello" });
});

// Login endpoint
router.post("/login_business", (req, res) => {
  mainCtrl.login_business_user(req, res);
});

// Health check endpoint for production monitoring
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
