const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  status: {
    type: String,
    default: "open",
  },
  price: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  photos: [String],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
});

module.exports = mongoose.model("Post", postSchema);