const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Token = require("./Token");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    max: 255,
  },
  password: {
    type: String,
    max: 100,
    min: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  cards: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Card'}
  ],
  ips: [
    {
      type: String,
    }
  ],
  facebookID: {
    type: String,
    required: false, // only required for facebook users
    index: {
      unique: true,
      partialFilterExpression: { facebookID: { $type: 'string' } },
    },
    default: null,
  },
  googleID: {
    type: String,
    required: false, // only required for facebook users
    index: {
      unique: true,
      partialFilterExpression: { googleID: { $type: 'string' } },
    },
    default: null,
  },
  twitterID: {
    type: String,
    required: false, // only required for facebook users
    index: {
      unique: true,
      partialFilterExpression: { twitterID: { $type: 'string' } },
    },
    default: null,
  },
  providerAccessToken: {
    type: String,
    required: false
  },
  providerRefreshToken: {
    type: String,
    required: false
  },
});

// create access and refresh tokens:
userSchema.methods = {
    createAccessToken: async function () {
        try {
            let { _id } = this;
	    let accessToken = jwt.sign(
                { _id: _id },
		process.env.JWT_ACCESS_SECRET,
		{ expiresIn: '10m' }
	    );
	    return accessToken;
	}catch (err) {
            console.log(err);
	    return;
	}; 
    },
    createRefreshToken: async function () {
        try {
	    let { _id } = this;
            const token = await Token.findById(_id);
            // if token exist delete and make a new one
	    if (token) {
              await token.delete();
	    }
	    let refreshToken = jwt.sign(
                { _id: _id },
		process.env.JWT_REFRESH_SECRET,
		{ expiresIn: '1d' }
	    );
	    await new Token({ _id: _id, token: refreshToken}).save();
	    return refreshToken;
	}catch (err) {
            console.log(err);
	    return;
	}; 
    },
};
module.exports = mongoose.model("User", userSchema);

