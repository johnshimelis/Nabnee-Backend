let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create projectplan/////////////////////////////////////////////////////////////////////////

module.exports.create_projectplan=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.projectplan_name) {
            resolve(dbhandler.create_projectplan(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
        
    });
}


////////////////////Read projectplan in various ways/////////////////////////////////////////////////////////////////////////////////

module.exports.read_projectplan=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
                resolve(dbhandler.read_projectplan(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

//////////////////Update projectplan//////////////////////////////////////////////////////////////////////////////////

module.exports.update_projectplan=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.projectplan_id) {
                resolve(dbhandler.update_projectplan(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete projectplan//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_projectplan=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.projectplan_id) {
                resolve(dbhandler.delete_projectplan(req.body.projectplan_id))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

