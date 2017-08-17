const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const fs = require('fs');
const EventEmitter = require('events');

class CloudFFmpeg {

  constructor(config) {
    this.emitter = new EventEmitter();
    this.config = config || {
      tempPath: '/tmp/'
    };
  }

  ffmpegLogCallback(error, stdout, stderr) {
    if (error !== "")
     console.log('[ERROR]: ' + error.message);
    console.log('[STDOUT]: ' + stdout);
    if (stderr !== undefined)
      console.log('[STDERR]: ' + stderr);
  }

  getStorage(storage) {
    switch (storage) {
    case "azure":
      return require('./storage/azure');
    case "local":
      return require('./storage/local');
    }
    return undefined;
  }

  createFFmpegCommand() {
    return ffmpeg()
      .on('error', this.ffmpegLogCallback)
      .on('progress', progress => {
        console.log('Testing progress: ' + progress.percent +
          '% completed!');
      })
      .on('end', this.ffmpegLogCallback);
  }

  downloadInputFiles(data) {
    const downloadTasks = data.input.map((input) => {
      const CloudStorage = this.getStorage(input.storage);
      const storage = new CloudStorage();
      return storage.downloadFile(
        input.path, this.config.tempPath
      )
    });
    return Promise.all(downloadTasks).then(() => data);
  }

  addInput(command, source) {
    const options = source.ffmpegOptions || {};
    const CloudStorage = this.getStorage(source.storage);
    const storage = new CloudStorage();
    const basePath = (source.storage !== "local") 
      ? this.config.tempPath : source.path.location;
    const path = basePath + source.path.targetName;
    return command
     .input(path)
     .inputOptions(options);
  }

  addOutput(command, source) {
    const options = source.ffmpegOptions || {};
    const CloudStorage = this.getStorage(source.storage);
    const storage = new CloudStorage();
    const path = this.config.tempPath + uuidV4() + '.' + source.path.targetName;
    return command
      .output(path)
      .outputOptions(options);
  }

  encode(data) {
    let command = this.createFFmpegCommand();
    command = data.input.reduce(
      this.addInput.bind(this),
      command
    );
    command = data.output.reduce(
      this.addOutput.bind(this),
      command
    );
    
    const result = _.zip(
      _.concat(
        _.filter(data.input, input => input.storage !== "local"),
        data.output
      ),
      _.concat(
        _.filter(
          _.zip(data.input, command._inputs),
          inputs => inputs[0].storage !== "local"
        ).map((input) => [input[1].source, false]),
        command._outputs.map((output) => [output.target, true])
      )
    ).map(sourceWithLocalPath => {
      return {
        storage: sourceWithLocalPath[0].storage,
        storagePath: sourceWithLocalPath[0].path,
        tempPath: sourceWithLocalPath[1][0],
        isOutput: sourceWithLocalPath[1][1]
      };
    });

    return new Promise((resolve, reject) => {
      command.on('end', (stdout, stderr) => {
        resolve(result);
      }).on('error', (stdout, stderr) => {
        reject(result);
      }).run();
    });
  }

  uploadFiles(encodeResult) {
    var uploadList = _.filter(
      encodeResult, 
      (element) => element.isOutput
    );
    const uploadTasks = uploadList.map((output) => {
      const CloudStorage = this.getStorage(output.storage);
      const storage = new CloudStorage();
      return storage.uploadFile(
        output.storagePath, output.tempPath
      )    
    });
    return Promise.all(uploadTasks).then(() => encodeResult);
  }

  unlinkFiles(tempFiles) {
    for (var files of tempFiles) {
      fs.unlink(files.tempPath);
    }
  }

  run(data) {
    return this.downloadInputFiles(data)
      .then(this.encode.bind(this))
      .then(this.uploadFiles.bind(this))
      .then(this.unlinkFiles);
  }
}

module.exports = CloudFFmpeg;
