const mongoose = require("mongoose");

const bidSchema = mongoose.Schema({
  contractor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Profile",
    required: true
  },
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  offerDate: {
    type: Date,
    required: true
  },
  offerPrice: {
    type: Number,
    required: true
  },
  confirmDate: {
    type: Date,
    default: null
  },
  ConfirmPrice: {
    type: Number,
    default: null
  },
  paid: {
    type: Boolean,
    required: true
  },

});

module.exports = mongoose.model("Bid", bidSchema);