const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const MateriallistSchema=new Schema({
    item_id : String,
    item_name : String,
    item_image : String,
    item_name_ar : String,
    type: String,
    type_ar: String,
    rate : Number,
    quantity:Number,
    unit : String,
    created_by : {type : String, default : "Admin"},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
    status : {type : String, default : "approved"},
});

MateriallistSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

MateriallistSchema.plugin(random);
const MateriallistSc =mongoose.model('materiallists',MateriallistSchema);

module.exports=MateriallistSc;