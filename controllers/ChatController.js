const mongoose = require('mongoose');
const Chat = require('../models/Chat');
exports.getChatId = async (req, res) => {
  console.log(req.body);
  try {
    let users = [
      mongoose.Types.ObjectId(req.user._id),
      mongoose.Types.ObjectId(req.body.friendId),
    ];
    let filter = { subscribers: { $all: users } };
    const chat = await Chat.findOne(filter).populate('subscribers');
    if (chat) {
      return res.status(200).json({chatId: chat._id, userId: req.user._id, profiles: chat.subscribers});
    } else {
      const newChat = await Chat.create({subscribers: users});
      return res.status(200).json({chatId: newChat._id, userId: req.user._id, profiles: chat.subscribers});
    };
  } catch(err) {
    console.log(err);
    return res.status(500).json({error: 'Error!'});
  };
};
