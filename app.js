require('dotenv').config({path: './config.env'});
const cookieParser = require('cookie-parser')
const express = require("express");
const fs = require('fs');
const https = require('https');
const path = require('path');
const socketIo = require("socket.io");
const { connectDB, mongoose } = require('./utils/db');

//initialize express app
const app = express();
const port = process.env.PORT;
//setup database connection
connectDB();

// for parsing cookies
app.use(cookieParser());
//for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// for parsing application/json
app.use(express.json());
//setup routes:
app.get("/", (req, res) => {
  return res.status(200).send("ok");
});
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const chatRoute = require("./routes/chat");
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/chat", chatRoute);

///////SSL Server//////
const sslServer = https.createServer(
	{
		key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
		cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
	},
	app
)

sslServer.listen(port , () => console.log(`Secure server running on :${port}`));

///////Socket IO///////
const io = socketIo(sslServer, {path: '/socket.io'});
const jwt = require('jsonwebtoken');
const Bid = require('./models/Bid');
const Notification = require('./models/Notification');
const Post = require('./models/Post');
const User = require('./models/User');

io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, process.env.JWT_ACCESS_SECRET, function(err, decoded) {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded;
      console.log('room id: ', decoded._id);
      socket.join(decoded._id);
      next();
    });
  }
  else {
    next(new Error('Authentication error'));
  }
})
.on('connection', (socket) => {
  console.log(`User connected to socket.`);
  socket.on('isOnline', async () => {
    try {
      const user = await User.findOneAndUpdate({_id: socket.user._id}, {isOnline: true}, {new: true});  
    } catch(err) {
      console.error(err);
    };
  });
  socket.on('addBid', async (data) => {
    // clean and structure date before creating new alert
    try {
      let bidData = {
         contractor: socket.user._id,
         status: "open",
         offerPrice: data.offerPrice,
         offerDate: data.offerDate,
         timestamp: Date.now(),
         paid: false
      };
      const newBid = new Bid(bidData);
      await newBid.save();
      let postData = {
        $push: {
          bids: newBid._id,
        }
      };
      const post = await Post.findOneAndUpdate({_id: data.postId}, postData, {new: true});
      let alertData = {
        receiver: post.author,
        sender: socket.user._id,
        desc: 'new',
        link: post._id,
        flag: 'bid'
      };
      const newAlert = new Notification(alertData);
      await newAlert.save();
      let payload = await Notification.findOne({_id: newAlert._id}).populate('author', 'imageURL alias');
      io.in(socket.user._id).emit('newAlert', payload );
    } catch(err) {
      console.error(err);
    }
  });
  socket.on('getAlerts', async () => {
    try {
      let alerts = await Notification.find({receiver: socket.user._id}).select('-receiver').populate('sender', 'imageURL alias -_id');
      if (alerts) {
        socket.emit('allAlerts', alerts);
      }
    } catch(err) {};
  });
  socket.on('disconnect', async () => {
    try {
      console.log('user disconnected');
      const user = await User.findOneAndUpdate({_id: socket.user._id}, {isOnline: false}, {new: true});
    } catch(err) { console.log(err) }
  });
  socket.on("ping", async () => {
    console.log('ping');
  });
});
