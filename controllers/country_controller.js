let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create Blog/////////////////////////////////////////////////////////////////////////

module.exports.create_country=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.country_name) {
            dbhandler.search_country(req.body.country_name).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_country(req, res))
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

module.exports.read_country=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
                resolve(dbhandler.read_country(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

//////////////////Update Inventory//////////////////////////////////////////////////////////////////////////////////

module.exports.update_country=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.id) {
                resolve(dbhandler.update_country(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete Inventory//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_country=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.id) {
                resolve(dbhandler.delete_country(req.body.id))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

////////////////////////////Create collections////////////////////////////////////////////////////////////////////////////







