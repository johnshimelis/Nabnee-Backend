let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create material/////////////////////////////////////////////////////////////////////////

module.exports.create_materiallist=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.item_name) {
            dbhandler.search_materiallist(req.body.item_name).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_materiallist(req, res))
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

module.exports.read_materiallist=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
                resolve(dbhandler.read_materiallist(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

module.exports.read_materiallist_new=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
                resolve(dbhandler.read_materiallist_new(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

//////////////////Update material//////////////////////////////////////////////////////////////////////////////////

module.exports.update_materiallist=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.item_id) {
                resolve(dbhandler.update_materiallist(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete material//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_materiallist=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.item_id) {
                resolve(dbhandler.delete_materiallist(req.body.item_id))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

