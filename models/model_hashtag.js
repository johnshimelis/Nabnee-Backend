const mongoose = require("mongoose");
let random = require("mongoose-random");
const Schema = mongoose.Schema;

const HashtagSchema=new Schema({
    hashtag_id:String,
    hashtag_text:String,
    business_id: { type: String, default: null },  // null for global hashtags, business_id for business-specific hashtags
    created_at:{
        type:Date,
        default:Date.now
    },
    updated_at:{
        type:Date,
        default:Date.now
    },
    usage_count:{
        type:Number, default:1},
        status:{
            type:String, default:"approved"}
});

HashtagSchema.pre("save", function(next){
    this.updated_at=Date.now();
    return next();
});
HashtagSchema.plugin(random, {path: 'random'});
const HashtagSc = mongoose.model("hashtags", HashtagSchema);
module.exports=HashtagSc;