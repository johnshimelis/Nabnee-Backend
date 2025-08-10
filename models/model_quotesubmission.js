const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const QuotesubmissionSchema=new Schema({
    quotesubmission_id: String,
    quote_id : {type: Schema.Types.ObjectId, ref:'quotes'},
    projectplan_id : {type: Schema.Types.ObjectId, ref:'projectplans'},
    price : Number,
    remark : String,
    attachments : [String],
    created_by : {type: Schema.Types.ObjectId, ref : 'business_users'},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
    status : {type : String, default : "approved"},
});

QuotesubmissionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

QuotesubmissionSchema.plugin(random);
const QuotesubmissionSc =mongoose.model('quotesubmission',QuotesubmissionSchema);

module.exports=QuotesubmissionSc;