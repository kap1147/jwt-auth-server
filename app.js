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
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

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
//const connection = mongoose.connection;
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Notification = require('./models/Notification');
//connection.once("open", () => {
//    console.log('MongoDB connection open');
//    const notificationChangeStream = connection.collection('notifications').watch();
//  
//    notificationChangeStream.on('change', (change) => {
//      switch (change.operationType) {
//        case 'insert':
//          const notification = change.fullDocument;
//  	      console.log(notification);
//      };
//    });
//  });

io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, process.env.JWT_ACCESS_SECRET, function(err, decoded) {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      socket.join(decoded._id)
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
      const user = await User.findOneAndUpdate({_id: socket.decoded._id}, {isOnline: true}, {new: true});  
    } catch(err) {
      console.error(err);
    };
  });
  socket.on('getAlerts', async () => {
    console.log('we are in loading alerts!');
    try {
      let alerts = await Notification.find({receiver: socket.decoded._id});
      if (alerts) {
        socket.emit('allAlerts', alerts)
      }
    } catch(err) {};
  });
  socket.on('disconnect', async () => {
    try {
      console.log('user disconnected');
      const user = await User.findOneAndUpdate({_id: socket.decoded._id}, {isOnline: false}, {new: true});
    } catch(err) { console.log(err) }
  });
  socket.on("ping", async () => {
    console.log('ping');
  });
});
