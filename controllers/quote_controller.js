let Promise = require("bluebird");
let dbhandler = require("../utils/dbhandler.js");
let resObj = require("../utils/response.js");

//////////////////////Create material/////////////////////////////////////////////////////////////////////////

module.exports.create_quote = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (
			req.body.item_name &&
			req.body.projectplan_id &&
			req.body.business_subcategory_id
		) {
			dbhandler
				.search_quote(req.body.item_name, req.body.projectplan_id)
				.then((resp) => {
					if (resp === "Allowed") {
						resolve(dbhandler.create_quote(req, res));
					} else if (resp === "Exists") {
						resolve(dbhandler.create_quote(req, res));
						// resolve(resObj.content_operation_responses("Exists",resp))
					} else {
						resolve(
							resObj.content_operation_responses("Error", resp)
						);
					}
				});
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

////////////////////Read material in various ways/////////////////////////////////////////////////////////////////////////////////

module.exports.read_quote = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (req.body.details) {
			resolve(dbhandler.read_quote(req, res));
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

//////////////////Update material//////////////////////////////////////////////////////////////////////////////////

module.exports.update_quote = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (req.body.quote_id) {
			resolve(dbhandler.update_quote(req, res));
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

//////////////////Delete material//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_quote = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (req.body.quote_id) {
			resolve(dbhandler.delete_quote(req.body.quote_id));
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

//***************************Collections***********************************************************************************
