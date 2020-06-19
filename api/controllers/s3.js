const _ = require('lodash');

function uploadVideos() {
  this.nodeEvent.emit('s3Upload');
}

module.exports = {
  uploadVideos
};
