let Promise = require("bluebird");
let dbhandler = require("../utils/dbhandler.js");
let resObj = require("../utils/response.js");

//////////////////////Create Project/////////////////////////////////////////////////////////////////////////

module.exports.create_project = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (req.body.project_name) {
			dbhandler
				.search_project(
					req.body.project_name,
					req.body.project_name_ar,
					req.body.created_by
				)
				.then((resp) => {
					console.log(resp);
					if (resp === "Allowed") {
						resolve(dbhandler.create_project(req, res));
					} else if (resp === "Exists") {
						resolve(
							resObj.content_operation_responses("Exists", resp)
						);
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

////////////////////Read Project/////////////////////////////////////////////////////////////////////////////////

module.exports.read_project_by_user = function (req, res) {
	return new Promise(function (resolve, reject) {
		resolve(
			dbhandler.read_project_by_user(
				req.body.createdBy || req.body.created_by,
				req.body.status
			)
		);
	});
};

////////////////////Read Project By Id/////////////////////////////////////////////////////////////////////////////////

module.exports.read_project_by_id = function (req, res) {
	return new Promise(function (resolve, reject) {
		resolve(dbhandler.read_project_by_id(req.body.project_id));
	});
};

//////////////////Update Project//////////////////////////////////////////////////////////////////////////////////

module.exports.update_project = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (req.body.project_id && req.body.created_by) {
			resolve(dbhandler.update_project(req, res));
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

//////////////////Delete Project//////////////////////////////////////////////////////////////////////////////////

module.exports.delete_project = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (req.body.project_id && req.body.created_by) {
			resolve(
				dbhandler.delete_project(
					req.body.project_id,
					req.body.created_by
				)
			);
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

//////////////Read Project All//////////////////////////////////////////////////////////////////////////////////////

module.exports.read_project_all = function (req, res) {
	return new Promise(function (resolve, reject) {
		if (req.body.details && req.body.offset) {
			resolve(dbhandler.read_project_all(req, res));
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

module.exports.move_listing_to_project = function (req, res) {
	return new Promise((resolve) => {
		const { listingID, oldProjectID, newProjectID } = req.body;
		if (listingID && newProjectID) {
			resolve(
				dbhandler.move_listing_to_project(
					listingID,
					oldProjectID,
					newProjectID
				)
			);
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};

module.exports.add_listing_to_project = function (req, res) {
	return new Promise((resolve) => {
		const { listingID, projectID } = req.body;
		if (listingID && projectID) {
			resolve(dbhandler.add_listing_to_project(listingID, projectID));
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};
module.exports.remove_listing_from_project = function (req, res) {
	return new Promise((resolve) => {
		const { listingID, projectID } = req.body;
		if (listingID && projectID) {
			resolve(
				dbhandler.remove_listing_from_project(listingID, projectID)
			);
		} else {
			resolve(resObj.content_operation_responses("Insufficient", req));
		}
	});
};
