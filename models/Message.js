const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
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
  },
  read: {
    type: Boolean,
    default: false
  },
});

module.exports = mongoose.model("Message", messageSchema);

