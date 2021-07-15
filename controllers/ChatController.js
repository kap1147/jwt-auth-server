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
    const chat = await Chat.findOne(filter);
    if (chat) {
      return res.status(200).json({chatId: chat._id});
    } else {
      const newChat = await Chat.create({subscribers: users});
      return res.status(200).json({chatId: newChat._id});
    };
  } catch(err) {
    console.log(err);
    return res.status(500).json({error: 'Error!'});
  };
};
