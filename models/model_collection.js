const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const CollectionSchema=new Schema({
    collection_id : String,
    collection_name : String,
    collection_description : String,
    collection_items : [{type: Schema.Types.ObjectId, ref : 'inventory'}],
    collection_type : String,
    status : {type : String, default : "approved"},
    collection_img : String,
    collection_theme_color : String,
    created_by : {type: Schema.Types.ObjectId, ref : 'business_users'},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
});

CollectionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

CollectionSchema.plugin(random);
const CollectionSc =mongoose.model('collections',CollectionSchema);

module.exports=CollectionSc;