const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const QuotesSchema=new Schema({
    quote_id: String,
    // materiallist_id : {type: Schema.Types.ObjectId, ref:'materiallists'},
    business_subcategory_id : {type: Schema.Types.ObjectId, ref:'business_subcategories'},
    projectplan_id : {type: Schema.Types.ObjectId, ref:'projectplans'},
    item_name : String,
    item_name_ar : String,
    type: String,
    type_ar: String,
    rate : Number,
    quantity:Number,
    unit : String,
    total : Number,
    remark : String,
    business_remark : String,
    business_attachments : [String],
    created_by : {type: Schema.Types.ObjectId, ref : 'business_users'},
    selectedsubmission : {type: Schema.Types.ObjectId, ref : 'quotesubmission'},
    request_sendto : [{type: Schema.Types.ObjectId, ref : 'business_users'}],
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
    status : {type : String, default : "approved"},
});

QuotesSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

QuotesSchema.plugin(random);
const QuotesSc =mongoose.model('quotes',QuotesSchema);

module.exports=QuotesSc;