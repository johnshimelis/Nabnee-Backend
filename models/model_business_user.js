const mongoose = require("mongoose");
let random = require("mongoose-random");

const Schema = mongoose.Schema;
const BranchSchema = require("./model_branch");
const HashtagSchema = require("./model_hashtag");
const BusinessUserSchema = new Schema({
  user_id: String,
  user_followers: Array,
  user_following: Array,
  user_type: { type: String, default: "General" },
  user_name: String,
  user_public_name: { type: String, unique: true, sparse: true },
  user_email: String,
  user_fcm: String,
  user_gid: String,
  user_fid: String,
  user_dp: String,
  user_password: String,
  user_permissions: [String],
  user_phone: String,
  user_language: String,
  user_country: String,
  user_status: { type: String, default: "pending" },
  custom_url: { type: String, unique: true, sparse: true },

  otp_code: { type: String, default: null },
  otp_expiry: { type: Date, default: null },
  otp_verified: { type: Boolean, default: false },

  password_reset_token: { type: String, default: null },
  password_reset_expiry: { type: Date, default: null },

  claim_token: { type: String, default: null },
  claim_token_expiry: { type: Date, default: null },

  business_name_english: String,
  business_name_arabic: String,
  branch_name: { type: String }, // New field for main branch name
  branch_name_ar: { type: String }, // Arabic branch name field
  business_category: [
    { type: Schema.Types.ObjectId, ref: "business_categories" },
  ],
  business_subcategory: [
    { type: Schema.Types.ObjectId, ref: "business_subcategories" },
  ],
  business_email: String,
  business_type: String,
  business_brand: String,
  business_brand_ar: String,
  business_space: String,
  business_space_ar: String,
  business_city: String,
  business_city_ar: String,
  business_hours: [
    {
      day: String,
      from: String,
      to: String,
    },
  ],
  leisure_hours: [
    {
      day: String,
      from: String,
      to: String,
    },
  ],
  location_lat: String,
  location_long: String,
  address: String,
  address_ar: String,
  logo: String,
  cover_image: String,
  noofquotes: { type: Number, default: 5 },
  max_hashtags: { type: Number, default: 5 },
  deals_in: [String],
  business_description_english: String,
  business_description_arabic: String,
  web_link: String,
  fb_link: String,
  instagram_link: String,
  youtube_link: String,
  twitter_link: String,
  ratings: { type: Number, default: 0 },
  business_featured: { type: Number, default: 0 },
  user_likes: [String],
  user_reviews: [
    {
      addedDate: { type: Date, default: Date.now },
      rating: { type: Number, default: 0 },
      comment: { type: String, default: "" },
      comment_by: { type: Schema.Types.ObjectId, ref: "business_users" },
    },
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  business_user_since: Date,
  branches: [BranchSchema],
  hashtags: [
    {
      hashtag_id: String,
      hashtag_text: String,
      usage_count: { type: Number, default: 1 },
      status: { type: String, default: "approved" },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
    },
  ],
});

BusinessUserSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  return next();
});

BusinessUserSchema.pre("save", function (next) {
  this.updated_at = Date.now();

  // Auto-approve social auth users
  if ((this.user_gid || this.user_fid) && this.user_status === "pending") {
    this.user_status = "approved";
  }

  return next();
});

BusinessUserSchema.plugin(random);
const BusinessUserSc = mongoose.model("business_users", BusinessUserSchema);

module.exports = BusinessUserSc;
