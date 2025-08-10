const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const BusinessFilterSchema=new Schema({
    filter_id : String,
    filter_name : String,
    filter_name_ar : String,
    // filter_type : {type : String, default : "regular"},
    // filter_values : String,
    // filter_values_ar : String,
    // filter_category : String,
    // filter_category_ar : String,
    // filter_subcategory : String,
    // filter_subcategory_ar : String,
    // status : {type : String, default : "approved"},
    // flter_img : String,
    // filter_theme_color : String,
    created_by : String,
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
});

BusinessFilterSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

BusinessFilterSchema.plugin(random);
const BuisnessFilterSc =mongoose.model('business_filters',BusinessFilterSchema);

module.exports=BuisnessFilterSc;