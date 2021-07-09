const User = require("../models/User");
const Profile = require("../models/Profile");
const Token = require("../models/Token");
const { serialize, getToken, getGoogleProfile, getUserToken } = require("../utils/helpers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.generateRefreshToken = async (req, res) => {
  try {
    //get refreshToken
    const { refreshToken } = req.body;
    //send error if no refreshToken is sent
    if (!refreshToken) {
      return res.status(403).json({ error: "Access denied,token missing!" });
    } else {
      //query for the token to check if it is valid:
      const tokenDoc = await Token.findOne({ token: refreshToken });
      //send error if no token found:
      if (!tokenDoc) {
        return res.status(401).json({ error: "Token expired!" });
      } else {
        //extract payload from refresh token and generate a new access token and send it
        const payload = jwt.verify(tokenDoc.token, process.env.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({ user: payload }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: "10m",
        });
        return res.status(200).json({ accessToken });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
exports.logout = async (req, res) => {
  try {
    //delete the refresh token saved in database:
    const { refreshToken } = req.body;
    await Token.findOneAndDelete({ token: refreshToken });
    res.clearCookie('refreshToken', {path: '/'});
    return res.status(200).json({ success: "User logged out!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

exports.getToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    let token = req.cookies.refreshToken;
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded){
      let isValidToken = await Token.findOne({token: token});
      if (isValidToken){
	const user = await User.findById(decoded._id);
	if (user){
	  let accessToken = await user.createAccessToken();
          return res.status(200).json({accessToken: accessToken});
	};
      };
    };
  } catch(err) {
    console.error(err);
    return res.send(err);
  };
};

exports.getUser = async (req, res) => {
  try {
    const profile = await Profile.findById(req.user._id);
    if (profile) {
      return res.status(200).json({user: {
        imageURL: profile.imageURL,
	alias: profile.alias
      }});
    }
  } catch(err) {
    console.error(err);
    return res.send(err);
  };
};

exports.googleCallback = async (req, res) => {
  try {
    if (req.query.code) {
    let data = serialize({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://theyardapp.com/api/auth/google/callback',
    });
    const redirectURI = ('https://oauth2.googleapis.com/token?' + data);
    const tokenObj = await getToken(redirectURI);
    const profile =  getGoogleProfile(tokenObj.id_token);
    // find current user in UserModel
    let token = await getUserToken(profile);
    // TODO
    let time = 6000 * 60 * 60 * 4;
    res.cookie('refreshToken', token.refreshToken, {path: '/', maxAge: time});
    return res.redirect('https://theyardapp.com')
    };
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

exports.googleLogin = (req, res) => {
  let data = serialize({
    client_id: process.env.GOOGLE_CLIENT_ID,
    scope: 'email profile',
    redirect_uri: 'https://theyardapp.com/api/auth/google/callback',
    response_type: 'code'
  })
  const redirectURI = ('https://accounts.google.com/o/oauth2/v2/auth?' + data);
  res.redirect(redirectURI);
};
