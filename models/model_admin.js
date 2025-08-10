const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const AdminSchema=new Schema({
    admin_id : String,
    admin_name : String,
    admin_address : String,
    admin_img : String,
    admin_email : String,
    admin_password : String,
    smtp_email : String,
    smtp_password : String,
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
    status : {type : String, default : "approved"},
});

AdminSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

AdminSchema.plugin(random);
const AdminSc =mongoose.model('admin',AdminSchema);

module.exports=AdminSc;