let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create Business Category/////////////////////////////////////////////////////////////////////////

module.exports.create_collection=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.collection_name) {
            dbhandler.search_collection(req.body.collection_name).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_collection(req, res))
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

module.exports.read_collection=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.status && req.body.created_by) {
                resolve(dbhandler.read_collection_by_user(req.body.created_by, req.body.status))
        }
    });  
}

module.exports.read_collection_by_collection_id=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.collection_id) {
                resolve(dbhandler.read_collection_by_collection_id(req.body.collection_id))
        }
    });  
}

//////////////////Update Business Category//////////////////////////////////////////////////////////////////////////////////

module.exports.update_collection=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.collection_id && req.body.created_by) {
                resolve(dbhandler.update_collection(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete Business Category//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_collection=function(req, res) {
    return new Promise(function(resolve, reject) {
        if((req.body.collection_id) && (req.body.created_by)) {
                resolve(dbhandler.delete_collection(req.body.collection_id, req.body.created_by))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

////////////////////////////Create collections////////////////////////////////////////////////////////////////////////////







