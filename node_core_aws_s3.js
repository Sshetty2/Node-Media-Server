const context = require('./node_core_ctx');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const BUCKET_NAME = process.env.API_BASE_URL;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

const s3Bucket = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

const videoTypes = ['.ts', '.m3u8'];

class NodeAwsS3Server {
  constructor(config) {
    this.config = config;
  }

  async run() {
    context.nodeEvent.on('s3Upload', this.s3Upload.bind(this));
  }

  s3Upload() {
    const liveDirectoryPath = path.join(__dirname, 'live');
    fs.readdir(liveDirectoryPath, async (err, files) => {
      if (err) {
        return console.log('Unable to scan the live directory: ' + err);
      }

      for (const fileName of files) {
        await uploadToS3(liveDirectoryPath, fileName);
      }
    });
  }

  uploadToS3 = async (dirPath, fileName) => {
    const filePath = path.join(dirPath, fileName);

    if (!videoTypes.includes(path.extname(filePath))) {
      return;
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: `live/${fileName}`,
    };

    try {
      await s3Bucket.headObject(params).promise();
      return console.log('File already exist: ' + fileName);

    } catch (err) { // video file is not yet uploaded to s3 bucket
      const readStream = fs.createReadStream(filePath);
      params.Body = readStream

      try {
        await s3Bucket.upload(params).promise();
        readStream.destroy();
      } catch (err) { // upload error
        return console.log('Upload error: ' + err);
      }
    }
  }
}

module.exports = NodeAwsS3Server;
