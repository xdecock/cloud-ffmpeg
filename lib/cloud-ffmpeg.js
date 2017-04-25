const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const fs = require('fs');
        
class CloudFFmpeg {

  constructor(config) {
    this.config = config || {
      tempPath: '/tmp/'
    };
  }  

  ffmpegLogCallback(error, stdout, stderr) {
    console.log('[ERROR]: ' + error.message);
    console.log('[STDOUT]: ' + stdout);
    console.log('[STDERR]: ' + stderr);
  }

  getStorage(storage) {
    switch (storage) {
    case "azure":
      return require('./storage/azure');
    }
    return undefined;
  }

  createFFmpegCommand() {
    return ffmpeg()
      .on('error', this.ffmpegLogCallback)
      .on('end', this.ffmpegLogCallback);
  }
  
  addInput(command, source) {
    const options = source.ffmpegOptions || {};
    const CloudStorage = this.getStorage(source.storage);
    const storage = new CloudStorage();
    let stream = storage.downloadStream(source.path);
    return command
      .input(stream)
      .inputOptions(options);
  }

  addOutput(command, source) {
    const options = source.ffmpegOptions || {};
    const CloudStorage = this.getStorage(source.storage);
    const storage = new CloudStorage();
    const path = this.config.tempPath + uuidV4() + '.' + source.path.blobName;
    return command
      .output(path)
      .outputOptions(options);
  }

  run(data) {
    let command = this.createFFmpegCommand();
    command = data.input.reduce(
      this.addInput.bind(this),
      command
    );
    command = data.output.reduce(
      this.addOutput.bind(this),
      command
    );
    
    return new Promise((resolve, reject) => {
      command.on('end', (stdout, stderr) => {
        const tasks = _.zip(
          data.output,
          command._outputs.map(
            (output) => output.target
          )
        ).map((sourceWithLocalPath) => {
          const source = sourceWithLocalPath[0],
                localPath = sourceWithLocalPath[1];
          const CloudStorage = this.getStorage(source.storage);
          const storage = new CloudStorage();
          return storage.uploadFile(
            source.path, localPath
          ).then(() => {
            new Promise((resolve, reject) => {
              fs.unlink(localPath, resolve);
            });
          });
        });
        Promise.all(tasks).then(resolve).catch(reject);
      }).run();
    });
  }
}

module.exports = CloudFFmpeg;
