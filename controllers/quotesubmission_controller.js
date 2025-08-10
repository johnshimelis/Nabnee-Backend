let Promise = require('bluebird');
let dbhandler = require('../utils/dbhandler.js');
let resObj = require('../utils/response.js');


//////////////////////Create material/////////////////////////////////////////////////////////////////////////

module.exports.create_quotesubmission=function(req, res) {
    return new Promise(function(resolve,reject) {
        if(req.body.quote_id && req.body.projectplan_id) {
            dbhandler.search_quotesubmission(req.body.quote_id,req.body.projectplan_id,req.body.created_by).then((resp) => {
                if(resp === "Allowed") {
                    resolve(dbhandler.create_quotesubmission(req, res))
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

module.exports.read_quotesubmission=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.details) {
                resolve(dbhandler.read_quotesubmission(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });  
}

//////////////////Update material//////////////////////////////////////////////////////////////////////////////////

module.exports.update_quotesubmission=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.quotesubmission_id) {
                resolve(dbhandler.update_quotesubmission(req, res))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

//////////////////Delete material//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_quotesubmission=function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.quotesubmission_id) {
                resolve(dbhandler.delete_quotesubmission(req.body.quotesubmission_id))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


//***************************Collections***********************************************************************************

module.exports.numberOfQuotationEequestsCreatedToday=function(req, res) {
    return new Promise(function(resolve, reject) {
                resolve(dbhandler.numberOfQuotationEequestsCreatedToday(req, res))
    });  
}
module.exports.numberOfRequestsTillDate=function(req, res) {
    return new Promise(function(resolve, reject) {

                resolve(dbhandler.numberOfRequestsTillDate(req, res))
    });  
}
module.exports.numberOfQuotationsSentToRequestsByBusinessesToday=function(req, res) {
    return new Promise(function(resolve, reject) {
        
                resolve(dbhandler.numberOfQuotationsSentToRequestsByBusinessesToday(req, res))
        
    });  
}
module.exports.numberOfQuotationsSentToRequestsByBusinessesTillDate=function(req, res) {
    return new Promise(function(resolve, reject) {
                resolve(dbhandler.numberOfQuotationsSentToRequestsByBusinessesTillDate(req, res))
    });  
}
