const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const InventorySubCategorySchema=new Schema({
    inventory_subcategory_id : String,
    inventory_subcategory_name : String,
    inventory_subcategory_name_ar : String,
    inventory_category_name : String,
    inventory_category_name_ar : String,
    inventory_category_oid : {type: Schema.Types.ObjectId, ref : 'inventory_categories'},
    inventory_subcategory_type : String,
    inventory_subcategory_img : String,
    inventory_subcategory_icon : String,
    inventory_subcategory_theme_color : String,
    created_by : String,
    status : {type : String, default : "approved"},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
});

InventorySubCategorySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

InventorySubCategorySchema.plugin(random);
const InventorySubCategorySc =mongoose.model('inventory_subcategories',InventorySubCategorySchema);

module.exports=InventorySubCategorySc;