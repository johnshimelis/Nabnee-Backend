const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const BlogSchema=new Schema({
    blog_id : String,
    blog_title : String,
    blog_title_ar : String,
    blog_body : String,
    blog_body_ar : String,
    blog_img : String,
    blog_theme_color : String,
    blog_type : {type : String, default : "Public"},
    blog_likes : Number,
    blog_shares : Number,
    blog_bookmarks : Number,
    blog_comments : String,
    created_by : {type : String, default : "Admin"},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
    status : {type : String, default : "approved"},
});

BlogSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

BlogSchema.plugin(random);
const BlogSc =mongoose.model('blogs',BlogSchema);

module.exports=BlogSc;