const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const InventoryCategorySchema=new Schema({
    inventory_category_id : String,
    inventory_category_name : String,
    inventory_category_name_ar : String,
    inventory_category_type : String,
    status : {type : String, default : "approved"},
    inventory_category_icon : String,
    inventory_category_img : String,
    created_by : String,
    inventory_category_theme_color : String,
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
});

InventoryCategorySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

InventoryCategorySchema.plugin(random);
const InventoryCategorySc =mongoose.model('inventory_categories',InventoryCategorySchema);

module.exports=InventoryCategorySc;