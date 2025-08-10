
let Promise = require("bluebird");
let dbhandler = require("../utils/dbhandler");
let resObj = require("../utils/response.js");


module.exports.create_hashtag = function(req, res) {
    return new Promise(function(resolve, reject) {
        console.log("Create Hashtag", req.body);
        if(req.body.hashtag_text) {
            dbhandler.search_hashtag(req.body.hashtag_text).then((resp) => {
                if(resp === "Allowed") {
                    console.log("Creating Hashtag");
                    
                    resolve(dbhandler.create_hashtag(req, res))
                }
                else if(resp ==="Exists") {
                    resolve(dbhandler.increment_hashtag(req.body.hashtag_text))
                }
                else {
                    resolve(resObj.content_operation_responses("Error", resp))
                }
            })
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

module.exports.read_hashtag_all = function(req, res) {
    return new Promise(function(resolve, reject) {
        const daysOld = req.body.daysOld || 30; // Default to showing 30 days
        resolve(dbhandler.read_hashtag_all(daysOld))
    });  
}

module.exports.search_hashtags = function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.query) {
            resolve(dbhandler.search_hashtags(req.body.query))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}


module.exports.update_hashtag_status = function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.hashtag_id && req.body.status) {
            resolve(dbhandler.update_hashtag_status(req.body.hashtag_id, req.body.status))
        }
        else {
            resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

module.exports.delete_hashtag = function(req, res) {
    return new Promise(function(resolve, reject) {
        if(req.body.hashtag_id) {
           resolve(dbhandler.delete_hashtag(req, res))
        }
        else {
           resolve(resObj.content_operation_responses("Insufficient", req));
        }
    });
}

exports.add_business_hashtag = function(req, res) {
    if (!req.body.business_id) {
        return res.send(resObj.content_operation_responses("InvalidInput", "Business ID is required"));
    }
    if (!req.body.hashtag_text) {
        return res.send(resObj.content_operation_responses("InvalidInput", "Hashtag text is required"));
    }

    dbhandler.add_business_hashtag(req, res)
    .then((response) => {
        res.send(response);
    })
    .catch((error) => {
        console.error("Error in add_business_hashtag:", error);
        res.send(resObj.content_operation_responses("Error", error));
    });
};

exports.get_business_hashtags = function(req, res) {
    if (!req.body.business_id) {
        return res.send(resObj.content_operation_responses("InvalidInput", "Business ID is required"));
    }

    dbhandler.get_business_hashtags(req.body.business_id)
    .then((response) => {
        res.send(response);
    })
    .catch((error) => {
        console.error("Error in get_business_hashtags:", error);
        res.send(resObj.content_operation_responses("Error", error));
    });
};


exports.update_business_hashtag_limit = function(req, res) {
    if (!req.body.business_id) {
        return res.send(resObj.content_operation_responses("InvalidInput", "Business ID is required"));
    }
    if (!req.body.max_hashtags || isNaN(req.body.max_hashtags) || req.body.max_hashtags < 0) {
        return res.send(resObj.content_operation_responses("InvalidInput", "Valid max_hashtags value is required"));
    }

    dbhandler.update_business_hashtag_limit(req, res)
    .then((response) => {
        res.send(response);
    })
    .catch((error) => {
        console.error("Error in update_business_hashtag_limit:", error);
        res.send(resObj.content_operation_responses("Error", error));
    });
};