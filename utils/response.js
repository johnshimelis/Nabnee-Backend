let jwt    = require('jsonwebtoken');
let ConstantCtrl = require('./constants.js');
module.exports.register_resp = function(status, data) {
	if(status === "Registered") {
		let token = jwt.sign({user_email: data.user_email,userId:data._id},ConstantCtrl.JWT_SECRET,{ expiresIn: "365d" });
		return {success : true, message : "User registered successfully", user_details : [data], user_token : token};
	}
	else if(status === "LoggedIn") {
		let token = jwt.sign({user_email: data.user_email,userId:data._id},ConstantCtrl.JWT_SECRET,{ expiresIn: "365d" });
		return {success : true, user_details : [data], user_token : token};
	}
	else if(status === "PasswordMismatch") {
		return {success : false, message : "Password didn't match"};
	}
	else if(status === "ModeMismatch") {
		return {success : false, message : "It seems you already have an account. Please try logging in with other options."};
	}
	else if(status === "AccountExist") {
		return {success : false, message : "It seems you already have an account. Please try logging in or click of forget password."};
	}
	else if(status === "PasswordInvalid") {
		return {success : false, message : data || "Password does not meet security requirements."};
	}
	else if(status === "EmailInvalid") {
		return {success : false, message : data || "Please provide a valid email address."};
	}
};
module.exports.user_operation_responses = function(key, data) {
	if(key === "Updatedwithtoken") {
		let token = jwt.sign({user_email: data[0].user_email,userId:data[0]._id},ConstantCtrl.JWT_SECRET,{ expiresIn: "365d" });
		return {success : true, user_details : data,user_token : token};
	}
	if(key === "Updated") {
		return {success : true, user_details : [data]};
	}
	else if(key === "Followed") {
		return {success : true, message : "User followed"};
	}
	else if(key === "Unfollowed") {
		return {success : true, message : "User unfollowed"};
	}
	else if(key === "Insufficient details") {
		return {success : false, message : "Insufficient details"};
	}
	else if(key === "Error") {
		return {success : false, message : "Try again"};
	}
	else if(key === "Verify") {
		return {success : true, verified : data};
	}
	else if(key === "Not found") {
		return {success : false, message : "User not found"};
	}
	else if(key ==="DeleteUser") {
		return {success : true, message : "User deleted"};
	}
	else if(key ==="DeleteUserError") {
		return {success : false, message : "User not deleted"};
	}
	else if(key ==="Fetch") {
		return {success : true, message : "Data fetched", details : data};
	}
	else if(key ==="DistanceFilter") {
		return {success : true, message : "Data fetched", details : data};
	}
	else if(key ==="Unavailable") {
		return {success : false, message : "Data not found"};
	}

}
module.exports.content_operation_responses = function(key, data) {
	if(key === "Created") {
		return {success : true, message : "Data created", details : data};
	}
	else if(key === "Updated") {
		return {success : true, message : "Data updated", details : data};
	}
	else if(key === "Insufficient details") {
		return {success : false, message : "Insufficient details"};
	}
	else if(key === "Error") {
		return {success : false, message : "Try again"};
	}
	else if(key ==="DeleteContent") {
		return {success : true, message : "Data deleted"};
	}
	else if(key ==="DeleteContentError") {
		return {success : false, message : "Data not deleted"};
	}
	else if(key ==="Exists") {
		return {success : false, message : "Already exists"};
	}
	else if(key ==="Unavailable") {
		return {success : false, message : "Data not found"};
	}	else if(key ==="Fetch") {
		return {success : true, message : "Data fetched", details : data};
	}
	else if(key === "Deleted") {
		return {success : true, message : "Data deleted", details : data};
	}
	else if(key === "Insufficient") {
		return {success : false, message : "Insufficient details"};
	}
	else {

	}

}
module.exports.notification_operation_responses = function(key) {
	if(key === "MailSent") {
		return {success : true, message : "Mail sent"};
	}
	else if(key === "MailNotSent") {
		return {success : false, message : "Mail not sent"};
	}
	else if(key === "NotificationSent") {
		return {success : true, message : "Notification sent"};
	}
	else if(key === "NotificationNotSent") {
		return {success : false, message : "Notification not sent"};
	}
	else {

	}

}
