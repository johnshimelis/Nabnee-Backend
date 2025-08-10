let Promise = require("bluebird");
let dbhandler = require("../utils/dbhandler.js");
let resObj = require("../utils/response.js");

//////////////////////Create Business filter/////////////////////////////////////////////////////////////////////////

module.exports.create_business_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.filter_name) {
      dbhandler
        .search_business_filter(req.body.filter_name, req.body.filter_name_ar)
        .then((resp) => {
          console.log(resp);
          if (resp === "Allowed") {
            resolve(dbhandler.create_business_filter(req, res));
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

////////////////////Read Business Filter/////////////////////////////////////////////////////////////////////////////////

module.exports.read_business_filter_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    resolve(dbhandler.read_business_filter_all(req.body.filters));
  });
};

//////////////////Update Business Filters//////////////////////////////////////////////////////////////////////////////////

module.exports.update_business_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.filter_id && req.body.created_by) {
      resolve(dbhandler.update_business_filter(req, res));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//////////////////Delete Business Filters//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_business_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.filter_id && req.body.created_by) {
      resolve(
        dbhandler.delete_business_filter(
          req.body.filter_id,
          req.body.created_by
        )
      );
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//***************************Product Filters***********************************************************************************

//////////////////////Create Business filter/////////////////////////////////////////////////////////////////////////

module.exports.create_inventory_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.filter_name) {
      dbhandler
        .search_inventory_filter(req.body.filter_name, req.body.filter_name_ar)
        .then((resp) => {
          if (resp === "Allowed") {
            resolve(dbhandler.create_inventory_filter(req, res));
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

////////////////////Read Business Filter/////////////////////////////////////////////////////////////////////////////////

module.exports.read_inventory_filter_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.filters) {
      resolve(dbhandler.read_inventory_filter_all(req.body.filters));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//////////////////Update Inventory//////////////////////////////////////////////////////////////////////////////////

module.exports.update_inventory_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    console.log("update inventory!!", req.body);
    if (req.body.filter_id && req.body.created_by) {
      resolve(dbhandler.update_inventory_filter(req, res));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//////////////////Delete Inventory//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_inventory_filter = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.filter_id && req.body.created_by) {
      resolve(
        dbhandler.delete_inventory_filter(
          req.body.filter_id,
          req.body.created_by
        )
      );
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};

//***************************Tags***********************************************************************************

module.exports.create_tag = function (req, res) {
  console.log("Ctag--1:", req.body);
  if (req.body.tag) {
    dbhandler.create_tag(req, res);
  } else {
    console.log("Ctag--Insufficient:", req.body);
    res.send(resObj.content_operation_responses("Insufficient", req));
  }
};

////////////////////Read Business Filter/////////////////////////////////////////////////////////////////////////////////

module.exports.read_tag_all = function (req, res) {
  return new Promise(function (resolve, reject) {
    resolve(dbhandler.read_tag_all());
  });
};

module.exports.update_tag = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.tag_id && req.body.tag) {
      resolve(dbhandler.update_tag(req, res));
    } else {
      resolve(resObj.content_operation_responses("Insufficient", req));
    }
  });
};
module.exports.delete_tag = function (req, res) {
  if (req.body) {
    dbhandler.delete_tag(req, res);
  } else {
    res.send(resObj.content_operation_responses("Insufficient", req));
  }
};

module.exports.search_tag = function (req, res) {
  return new Promise(function (resolve, reject) {
    if (req.body.tag) {
      dbhandler.search_tag(req.body.tag).then((resp) => {
        if (resp === "Allowed") {
          resolve(dbhandler.search_tag(req, res));
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
module.exports.read_tag_by_id = function (req, res) {
  dbhandler.read_tag_by_id(req, res);
};

module.exports.get_tags_by_inventory = function (req, res) {
  dbhandler.get_tags_by_inventory(req, res);
};
module.exports.remove_tag_from_inventory = function (req, res) {
  dbhandler.remove_tag_from_inventory(req, res);
};
exports.search_inventory_by_tag = dbhandler.search_inventory_by_tag;
