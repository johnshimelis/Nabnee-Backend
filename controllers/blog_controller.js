let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create Blog/////////////////////////////////////////////////////////////////////////

module.exports.create_blog=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.blog_title) {
            dbhandler.search_blog(req.body.blog_title, req.body.blog_title_ar).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_blog(req, res))
                }
                else if(resp ==="Exists") {
                    resolve(resObj.content_operation_responses("Exists",resp))
                }
                else {
                    resolve(resObj.content_operation_responses("Error",resp))
                }
            })
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
        
    });
}


////////////////////Read Blog in various ways/////////////////////////////////////////////////////////////////////////////////

module.exports.read_blog_by_user=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.status && req.body.created_by) {
                resolve(dbhandler.read_blog_by_user(req.body.created_by, req.body.status))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

module.exports.read_blog_by_id=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.blog_id && req.body.status) {
                resolve(dbhandler.read_blog_by_id(req.body.blog_id, req.body.status))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

module.exports.read_blog_all=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details && req.body.offset) {
                resolve(dbhandler.read_blog_all(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

//////////////////Update Inventory//////////////////////////////////////////////////////////////////////////////////

module.exports.update_blog=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.blog_id && req.body.created_by) {
                resolve(dbhandler.update_blog(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete Inventory//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_blog=function(req, res) {
    return new Promise(function(resolve, reject) {
        if((req.body.blog_id) && (req.body.created_by)) {
                resolve(dbhandler.delete_blog(req.body.blog_id, req.body.created_by))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

////////////////////////////Create collections////////////////////////////////////////////////////////////////////////////







