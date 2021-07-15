const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: { 
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  flag: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  }
});

module.exports = mongoose.model("Message", messageSchema);

