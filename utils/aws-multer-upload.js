const multer = require('multer');
const AWS = require('aws-sdk');
var multerS3 = require('multer-s3');
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

AWS.config.update({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_KEY,
    region: 'us-east-1'
});

const s3 = new AWS.S3();


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'theyardapp-server',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
});

const deleteImage = (key) => {
  var params = {
  bucket: process.env.AWS_BUCKET_NAME,  
  Key: key
 };
 s3.deleteObject(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else return true;
 });
}

module.exports = {
    upload,
    deleteImage
}
