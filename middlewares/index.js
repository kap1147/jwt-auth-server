const jwt = require("jsonwebtoken");
const Helpers = require('../utils/helpers');
//middleware function to check if the incoming request in authenticated:
exports.checkAuth = (req, res, next) => {
  // get the token stored in the custom header called 'x-auth-token'
  const token = req.get("x-auth-token");

  //send error message if no token is found:
  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing!" });
  } else {
    try {
      //if the incoming request has a valid token, we extract the payload from the token and attach it to the request object.
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const isValid = Helpers.verifyRefreshToken(payload._id);
      if (isValid) {
        req.user = {};
        req.user._id = payload._id;
        next();
      } else {
        res.clearCookie('refreshToken', {path: '/'});
	return res.status(401).json({error: 'Invalid token, please login again!'});;
      };
    } catch (error) {
      // token can be expired or invalid. Send appropriate errors in each case:
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "Session timed out, please login again" });
      } else if (error.name === "JsonWebTokenError") {
	res.clearCookie('refreshToken', {path: '/'});
        return res
          .status(401)
          .json({ error: "Invalid token, please login again!" });
      } else {
        //catch other unprecedented errors
        console.error(error);
        return res.status(400).json({ error });
      }
    }
  }
};
