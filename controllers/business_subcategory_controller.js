let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create Business Category/////////////////////////////////////////////////////////////////////////

module.exports.create_business_subcategory=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.business_subcategory_name && req.body.created_by) {
            dbhandler.search_business_subcategory(req.body.business_subcategory_name, req.body.business_subcategory_name_ar,req.body.business_category_oid).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_business_subcategory(req, res))
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


// ////////////////////Read Business Sub Category/////////////////////////////////////////////////////////////////////////////////

module.exports.read_business_subcategory=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.status && !req.body.business_subcategory_name && !req.body.business_category_oid) {
            switch(req.body.status) {
                case "approved" :
                    resolve(dbhandler.read_business_subcategory_approved())
                    break;
                case "disapproved" :
                    resolve(dbhandler.read_business_subcategory_disapproved())
                    break;
                case "all" :
                    resolve(dbhandler.read_business_subcategory_all())
                    break;
                default:
                    break;  
            }
        }
        else if(req.body.business_subcategory_name) {
            resolve(dbhandler.search_business_subcategory_public(req.body.business_subcategory_name))
        }
        else if(req.body.business_category_oid) {
            resolve(dbhandler.read_business_subcategory_by_category(req.body.business_category_oid))

        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

module.exports.read_business_subcategory_admin=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
            resolve(dbhandler.read_business_subcategory_admin(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

// //////////////////Update Business  Sub Category//////////////////////////////////////////////////////////////////////////////////

module.exports.update_business_subcategory=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.business_subcategory_id) {
                resolve(dbhandler.update_business_subcategory(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

// //////////////////Delete Business Sub Category//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_business_subcategory=function(req, res) {
    return new Promise(function(resolve, reject) {
        if((req.body.business_subcategory_id) && (req.body.created_by)) {
                resolve(dbhandler.delete_business_subcategory(req.body.business_subcategory_id, req.body.created_by))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}







