const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const ContractsSchema=new Schema({
    contract_id : String,
    materiallist_id : {type: Schema.Types.ObjectId, ref : 'materiallists'},
    projectplan_id : {type: Schema.Types.ObjectId, ref:'projectplans'},
    item_name : String,
    item_name_ar : String,
    type: String,
    rate : Number,
    quantity:Number,
    unit : String,
    total : Number,
    remark : String,
    created_by : {type: Schema.Types.ObjectId, ref : 'business_users'},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
    status : {type : String, default : "approved"},
});

ContractsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

ContractsSchema.plugin(random);
const ContractsSc =mongoose.model('contracts',ContractsSchema);

module.exports=ContractsSc;