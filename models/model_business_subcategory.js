const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const BusinessSubCategorySchema=new Schema({
    business_subcategory_id : String,
    business_subcategory_name : String,
    business_category_name : String,
    business_subcategory_name_ar : String,
    business_category_name_ar : String,
    business_category_oid : {type: Schema.Types.ObjectId, ref : 'business_categories'},
    business_subcategory_type : String,
    business_subcategory_img : String,
    business_subcategory_icon : String,
    business_subcategory_theme_color : String,
    created_by : String,
    status : {type : String, default : "approved"},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
});

BusinessSubCategorySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

BusinessSubCategorySchema.plugin(random);
const BusinessSubCategorySc =mongoose.model('business_subcategories',BusinessSubCategorySchema);

module.exports=BusinessSubCategorySc;