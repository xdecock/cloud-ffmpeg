const ffmpeg = require('fluent-ffmpeg');
const PassThrough = require('stream').PassThrough;

class CloudFFmpeg {

  getStorage(storage) {
    switch (storage) {
    case "azure":
      return require('./storage/azure');
    }
    return undefined;
  }

  getReadStream(source) {
    let storage = this.getReadStream(source);
    storage.getReadStream(source);
  }

  ffmpegLogCallback(error, stdout, stderr) {
    console.log('[ERROR]: ' + error.message);
    console.log('[STDOUT]: ' + stdout);
    console.log('[STDERR]: ' + stderr);
  }

  constructor(data) {
    this._ffmpeg = ffmpeg()
      .on('error', this.ffmpegLogCallback)
      .on('end', this.ffmpegLogCallback);

    for (let source of data.input) {
      const storage = this.getStorage(source.storage);
      const options = source.ffmpegOptions || {};
      let stream = storage.downloadStream(source.path);
      this._ffmpeg = this._ffmpeg
        .input(stream)
        .inputOptions(options);
    }

    for (let source of data.output) {
      const storage = this.getStorage(source.storage);
      const options = source.ffmpegOptions || {};
      let stream = new PassThrough();
      this._ffmpeg
        .clone()
        .output(stream)
        .outputOptions(options)
        .run();
      storage.uploadStream(source.path, stream);
    }
  }
}

module.exports = CloudFFmpeg;
