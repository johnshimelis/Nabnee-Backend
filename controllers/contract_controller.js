let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create material/////////////////////////////////////////////////////////////////////////

module.exports.create_contract=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.item_name && req.body.projectplan_id) {
            dbhandler.search_contract(req.body.item_name,req.body.projectplan_id).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_contract(req, res))
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


////////////////////Read material in various ways/////////////////////////////////////////////////////////////////////////////////

module.exports.read_contract=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
                resolve(dbhandler.read_contract(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

//////////////////Update material//////////////////////////////////////////////////////////////////////////////////

module.exports.update_contract=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.contract_id) {
                resolve(dbhandler.update_contract(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete material//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_contract=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.contract_id) {
                resolve(dbhandler.delete_contract(req.body.contract_id))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

module.exports.delete_all_contractbyproject_id=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.projectplan_id) {
                resolve(dbhandler.delete_all_contractbyproject_id(req.body.projectplan_id))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

