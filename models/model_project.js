const mongoose=require('mongoose');
let random = require('mongoose-random');
const Schema=mongoose.Schema;
const ProjectSchema=new Schema({
    project_id : String,
    project_name : String,
    project_name_ar : String,
    project_description : String,
    project_description_ar : String,
    project_items : [{type: Schema.Types.ObjectId, ref : 'inventory'}],
    project_type : {type : String, default : "Public"},
    status : {type : String, default : "approved"},
    project_img : String,
    project_theme_color : String,
    created_by : {type: Schema.Types.ObjectId, ref : 'business_users'},
    created_at : {type : Date, default : Date.now},
    updated_at : {type : Date, default : Date.now},
});

ProjectSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  return next();
});

ProjectSchema.plugin(random);
const ProjectSc =mongoose.model('projects',ProjectSchema);

module.exports=ProjectSc;