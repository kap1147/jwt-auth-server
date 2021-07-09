const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  title: {
      type: String,
      required: true
  },
  desc: String,
  icon: String
});

module.exports = mongoose.model("Tag", tagSchema);