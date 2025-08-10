let Promise = require("bluebird");
let dbhandler = require("../utils/dbhandler.js");
let resObj = require("../utils/response.js");

module.exports.create_business_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.business_category_name) {
      dbhandler
        .search_business_category(
          req.body.business_category_name,
          req.body.business_category_name_ar
        )
        .then((resp) => {
          if (resp === "Allowed") {
            resolve(dbhandler.create_business_category(req, res));
          } else if (resp === "Exists") {
            resolve(resObj.content_operation_responses("Exists", resp));
          } else {
            resolve(resObj.content_operation_responses("Error", resp));
          }
        });
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

////////////////////Read Business Category/////////////////////////////////////////////////////////////////////////////////

module.exports.read_business_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.status) {
      switch (req.body.status) {
        case "approved":
          resolve(dbhandler.read_business_category_approved(req, res));
          break;
        case "disapproved":
          resolve(dbhandler.read_business_category_disapproved(req, res));
          break;
        case "all":
          resolve(dbhandler.read_business_category_all(req, res));
          break;
        default:
          break;
      }
    } else if (req.body.business_category_name) {
      resolve(
        dbhandler.search_business_category_public(
          req.body.business_category_name
        )
      );
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

module.exports.read_business_category_admin = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.details) {
      resolve(dbhandler.read_business_category_admin(req, res));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//////////////////Update Business Category//////////////////////////////////////////////////////////////////////////////////

module.exports.update_business_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.business_category_id) {
      resolve(dbhandler.update_business_category(req, res));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//////////////////Delete Business Category//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_business_category = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.business_category_id && req.body.created_by) {
      resolve(
        dbhandler.delete_business_category(
          req.body.business_category_id,
          req.body.created_by
        )
      );
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//////////////////Get Business Category By ID//////////////////////////////////////////////////////////////////////////////////

module.exports.get_business_category_by_id = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.business_category_id) {
      resolve(
        dbhandler.get_business_category_by_id(req.body.business_category_id)
      );
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//***************************Collections***********************************************************************************

////////////////////////////Create collections////////////////////////////////////////////////////////////////////////////