const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
});

module.exports = mongoose.model('Chat', chatSchema);
