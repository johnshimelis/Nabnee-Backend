let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create Business Category/////////////////////////////////////////////////////////////////////////

module.exports.create_inventory_subcategory=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.inventory_subcategory_name && req.body.created_by) {
            dbhandler.search_inventory_subcategory(req.body.inventory_subcategory_name, req.body.inventory_subcategory_name_ar).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_inventory_subcategory(req, res))
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


// ////////////////////Read Inventory Sub Category/////////////////////////////////////////////////////////////////////////////////

module.exports.read_inventory_subcategory=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.status) {
            switch(req.body.status && !req.body.inventory_subcategory_name && !req.body.inventory_category_oid) {
                case "approved" :
                    resolve(dbhandler.read_inventory_subcategory_approved())
                    break;
                case "disapproved" :
                    resolve(dbhandler.read_inventory_subcategory_disapproved())
                    break;
                case "all" :
                    resolve(dbhandler.read_inventory_subcategory_all())
                    break;
                default:
                    break;  
            }
        }
        else if(req.body.inventory_subcategory_name) {
            resolve(dbhandler.search_inventory_subcategory_public(req.body.inventory_subcategory_name))
        }
        else if(req.body.inventory_category_oid) {
            resolve(dbhandler.read_inventory_subcategory_by_category(req.body.inventory_category_oid))

        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

module.exports.read_inventory_subcategory_admin=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
            resolve(dbhandler.read_inventory_subcategory_admin(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

// //////////////////Update Business  Sub Category//////////////////////////////////////////////////////////////////////////////////

module.exports.update_inventory_subcategory=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.inventory_subcategory_id) {
                resolve(dbhandler.update_inventory_subcategory(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

// //////////////////Delete Business Sub Category//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_inventory_subcategory=function(req, res) {
    return new Promise(function(resolve, reject) {
        if((req.body.inventory_subcategory_id) && (req.body.created_by)) {
                resolve(dbhandler.delete_inventory_subcategory(req.body.inventory_subcategory_id, req.body.created_by))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}







