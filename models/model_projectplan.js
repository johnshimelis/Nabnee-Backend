const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const ProjectplanSchema=new Schema({
    projectplan_id : String,
    projectplan_name : String,
    projectplan_name_ar : String,
    projectplan_contracts : [{type: Schema.Types.ObjectId, ref : 'contracts'}],
    projectplan_quotes : [{type: Schema.Types.ObjectId, ref : 'quotes'}],
    created_by : {type: Schema.Types.ObjectId, ref : 'business_users'},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
    status : {type : String, default : "approved"},
});

ProjectplanSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

ProjectplanSchema.plugin(random);
const ProjectplanSc =mongoose.model('projectplans',ProjectplanSchema);

module.exports=ProjectplanSc;