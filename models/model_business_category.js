const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const BusinessCategorySchema=new Schema({
    business_category_id : String,
    business_category_name : String,
    business_category_name_ar : String,
    business_category_type : String,
    status : {type : String, default : "approved"},
    business_category_icon : String,
    business_category_img : String,
    created_by : String,
    business_category_theme_color : String,
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
});

BusinessCategorySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

BusinessCategorySchema.plugin(random);
const BusinessCategorySc =mongoose.model('business_categories',BusinessCategorySchema);

module.exports=BusinessCategorySc;