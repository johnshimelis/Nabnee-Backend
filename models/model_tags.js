const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const TagSchema=new Schema({
	tag_id : String,
    tag : String,
     created_by:String,
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now}
});

TagSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

TagSchema.plugin(random);
const TagSc =mongoose.model('tags',TagSchema);

module.exports=TagSc;