const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const CountrySchema=new Schema({
    country_id : String,
    country_name : String,
    code : String,
    status : {type : String, default : "approved"},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now}
});

CountrySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

CountrySchema.plugin(random);
const CountrySc =mongoose.model('country',CountrySchema);

module.exports=CountrySc;