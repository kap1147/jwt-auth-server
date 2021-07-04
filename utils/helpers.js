const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const Profile = require('../models/Profile');
const User = require('../models/User');

exports.serialize = function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

exports.getUserToken = async function(profile) {
  // find current user in UserModel
    let user = await User.findOne({
        googleID: profile.sub
    });
    // create new user if the database doesn't have this user
    if (!user){
         user = await new User({
          googleID: profile.sub,
          email: profile.email,
        }).save()
      if (user) {
        // create new profile for user
        await new Profile({
          _id: user.id,
          imageURL: profile.picture,
          alias: profile.name,
          shippingID: null,
          billingID: null
        }).save()
      }
    }
    //generate a pair of tokens if valid and send
    let refreshToken = await user.createRefreshToken();
	
    return { refreshToken: refreshToken };
};

exports.getToken = async function (url = '') {
  try {  
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      //body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  } catch(error) {
    console.log(error);
    return;
  };
}

exports.getGoogleProfile = function (token){
  var decoded = jwt.decode(token);
  return decoded;
};
