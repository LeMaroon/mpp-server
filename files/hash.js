var crypto = require('crypto'); // crypto
module.exports = IP => {
	let hash = crypto.createHash('sha1');
	hash.update(IP + process.env.SALT + require("./config.js").salt);
	return hash.digest('hex');
}; // Hash function: generate (salted) hash
