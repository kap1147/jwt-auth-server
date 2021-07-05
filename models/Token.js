const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  token: { type: String },
});

module.exports = mongoose.model("Token", tokenSchema);
