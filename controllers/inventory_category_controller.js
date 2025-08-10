let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create Business Category/////////////////////////////////////////////////////////////////////////

module.exports.create_inventory_category=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.inventory_category_name) {
            dbhandler.search_inventory_category(req.body.inventory_category_name, req.body.inventory_category_name_ar).then((resp) => {
                console.log(resp);
                if(resp === "Allowed") {
                    resolve(dbhandler.create_inventory_category(req, res))
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


////////////////////Read Business Category/////////////////////////////////////////////////////////////////////////////////

module.exports.read_inventory_category=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.status) {
            switch(req.body.status) {
                case "approved" :
                    resolve(dbhandler.read_inventory_category_approved(req, res))
                    break;
                case "disapproved" :
                    resolve(dbhandler.read_inventory_category_disapproved(req, res))
                    break;
                case "all" :
                    resolve(dbhandler.read_inventory_category_all(req, res))
                    break;
                default:
                    break;  
            }
        }
        else if(req.body.inventory_category_name) {
            resolve(dbhandler.search_inventory_category_public(req.body.inventory_category_name))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}


module.exports.read_inventory_category_admin=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
            resolve(dbhandler.read_inventory_category_admin(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

//////////////////Update Business Category//////////////////////////////////////////////////////////////////////////////////

module.exports.update_inventory_category=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.inventory_category_id) {
                resolve(dbhandler.update_inventory_category(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete Business Category//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_inventory_category=function(req, res) {
    return new Promise(function(resolve, reject) {
        if((req.body.inventory_category_id) && (req.body.created_by)) {
                resolve(dbhandler.delete_inventory_category(req.body.inventory_category_id, req.body.created_by))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

////////////////////////////Create collections////////////////////////////////////////////////////////////////////////////







