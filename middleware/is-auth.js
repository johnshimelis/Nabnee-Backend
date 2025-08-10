const jwt = require("jsonwebtoken");
let ConstantCtrl = require("../utils/constants.js");

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	// console.log("Auth: ", authHeader);
	const id = req.get("_id");
	if (!authHeader) {
		//const error = new Error('Not authenticated.');
		return res.send({ success: false, message: "Not authenticated" });
		//error.statusCode = 401;
		//throw error;
	}
	const token = authHeader.split("#")[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, ConstantCtrl.JWT_SECRET);
		// console.log(decodedToken.userId);
	} catch (err) {
		err.statusCode = 500;
		return res.send({ success: false, message: "Authentication  Failed" });
		throw err;
	}
	if (!decodedToken) {
		//const error = new Error('Not authenticated.');
		error.statusCode = 401;
		res.send({ success: false, message: "Authentication  Failed" });
		//throw error;
	}
	// else{
	//    if(decodedToken.userId!=id){
	//      return res.send({success : false, message: 'Authentication  Failed' });
	//   }
	// }

	req.userId = decodedToken.userId;
	next();
};
