const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BranchSchema = new Schema({
  name: { type: String, required: true },
  name_ar: { type: String },
  branch_name: { type: String },
  branch_name_ar: { type: String },
  phone: { type: String },
  address: { type: String },
  address_ar: { type: String },
  location_lat: { type: String },
  location_long: { type: String },
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
  city: { type: String },
  city_ar: { type: String },
  is_main: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

BranchSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  return next();
});

module.exports = BranchSchema;
