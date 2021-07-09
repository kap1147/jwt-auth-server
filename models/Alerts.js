  
const mongoose = require("mongoose");

const alertSchema = mongoose.Schema({
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Profile" 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Profile" 
  },
  desc: {
    type: String,
    required: true
  },
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true
  },
  flag: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alert", alertSchema);
