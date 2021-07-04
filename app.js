const api = require("./routes");
const cookieParser = require('cookie-parser')
const express = require("express");
const fs = require('fs');
const https = require('https');
const path = require('path');
const { connectDB, mongoose } = require('./utils/db');
require('dotenv').config({path: './config.env'});

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

app.use("/api/auth", api);

///////SSL Server//////
const sslServer = https.createServer(
	{
		key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
		cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
	},
	app
)

sslServer.listen(port , () => console.log(`Secure server running on :${port}`))
