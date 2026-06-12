const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: "トークンなし" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).json({ message: "トークン無効" });
	}
};

module.exports = auth;
