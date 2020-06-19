const express = require('express');
const s3Controller = require('../controllers/s3');

module.exports = (context) => {
  let router = express.Router();
  router.get('/upload', s3Controller.upload.bind(context));
  return router;
};
