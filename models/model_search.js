const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const SearchSchema=new Schema({
    search_term : String,
    search_type : String,
    search_count : {type : Number, default : 0},
    created_at : {type: Date, default: Date.now},
    updated_at : {type: Date, default: Date.now},
    status : {type : String, default : "approved"},
});

SearchSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

SearchSchema.plugin(random);
const SearchSc =mongoose.model('searches',SearchSchema);

module.exports=SearchSc;