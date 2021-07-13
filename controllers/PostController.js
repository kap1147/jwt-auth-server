const Bid = require("../models/Bid");
const Helpers = require('../utils/helpers');
const mongoose = require('mongoose');
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const Profile = require("../models/Profile");
const Tag = require("../models/Tag");

exports.deletePost = async (req, res) => {
  Post.findByIdAndDelete(req.body.id, function (err, doc) {
    if (err) return res.send(err);
    let update = {
      $pull: { posts: doc._id },
    };
    Profile.findByIdAndUpdate(doc.author, update, function (err, doc) {
      if (err) return res.send(err);
      return res.send({ message: "Post deleted." });
    });
  });
};

exports.addPost = async (req, res) => {
  if (req.body.tags.length) {
    var data = req.body.tags.split(',');
    var tags = [];
    for (var i = 0; i < data.length; i++){
      tags.push(mongoose.Types.ObjectId(data[i]))
    }
  }
  let postData = {
    author: mongoose.Types.ObjectId(req.user._id),
    content: req.body.content,
    status: "open",
    price: req.body.price,
    photos: req.files[0].location,
    location: {
      type: "Point",
      coordinates: [req.body.lng, req.body.lat],
    },
    tags: tags
  };
  Post.create(postData, function (err, doc) {
    if (req.files){
      for (let i = 0; i < req.files.length; i++){
        doc.photos.push(req.files[i].location)
      }
    }
    doc.save();
    if (err) return res.send(err);
    let update = {
      $push: { posts: doc._id },
    };
    Profile.findByIdAndUpdate(doc.author, update, function (err, doc) {
      if (err) return res.send(err);
      return res.send({ message: "Post created successfully" });
    });
  });
};

exports.getPost = async (req, res) => {
  try {
    let post = await Post.findOne({_id: req.params.id}).populate("tags author")
    return res.json(post)
  } catch(err) {
    console.error(err)
    return res.status(500).send(err);
  };
  
};

exports.getAllPost = async (req, res) => {
  let local = {
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [-84.43165, 33.75805],
        }, //meters
        $maxDistance: 30 * 1609.34,
      },
    },
  };
  try {
    const posts = await Post.find(
      local,
      "author content price location timestamp"
    ).populate("author");
    return res.json(posts);
  }catch(err){
    return res.send({err: err })
  }
};

exports.getAllPostHome = async (req, res) => {
  let local = {
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [req.body.lon, req.body.lat],
        }, //meters
        $maxDistance: 30 * 1609.34,
      },
    },
  };
  const posts = await Post.find(
    local
  ).populate("author");
  return res.json(posts);
};

exports.openBid = (req, res) => {
  let data = {
    contractor: req.user._id,
    status: "open",
    offerPrice: req.body.offerPrice,
    offerDate: req.body.offerDate,
    timestamp: Date.now(),
    paid: false
  };
  Bid.create(data, function (err, doc) {
    if (err) res.send(err);
    Post.findByIdAndUpdate(
      req.params.id,
      { $push: { bids: doc._id } },
      function (err, doc) {
        if (err) return res.send(err);
	let notifyData = {
      receiver: doc.author,
      sender: req.user._id,
	  desc: 'New bid created.',
	  link: doc._id,
	  flag: 'bid',
	};
        Helpers.createNotification(notifyData);	
        return res.send({ message: "Bid placed." });
      }
    );
  });
};

exports.deleteBid = (req, res) => {
  let bidId = req.body.bidId;
  Bid.findOneAndDelete(bidId, function (err, doc) {
    if (err) return res.send(err);
    Post.findOneAndUpdate(
      { bids: bidId },
      { $pull: { bids: bidId } },
      function (err, doc) {
        if (err) return res.send(err);
        return res.send({ message: "Bid removed." });
      }
    );
  });
};

exports.getUserPost = async (req, res) => {
  try {
    const posts = await Post.find({author: req.user._id});
    if (posts) {
      return res.status(200).send({posts: posts});
    }
  } catch(err) {
    console.log(err);
  };
};
