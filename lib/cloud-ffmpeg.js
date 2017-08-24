const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;

class CloudFFmpeg extends EventEmitter {
  constructor(config) {
    super()
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
    var FFmpeg = ffmpeg()
      .on('start', command => {
        this.emit('start');
      })
      .on('error', (error, stdout, stderr) => {
        this.emit('error', error);
        this.ffmpegLogCallback(error, stdout, stderr);
      })
      .on('progress', progress => {
        this.emit('progress', progress)
      })
      .on('end', (stdout, stderr) => {
        this.emit('end');
        this.ffmpegLogCallback("", stdout, stderr);
      });
    this
      .removeAllListeners('kill')
      .on('kill', () => {
      if (FFmpeg)
        FFmpeg.kill();
    });
    return FFmpeg
  }

  downloadInputFiles(data) {
    const downloadTasks = data.input.map((input) => {
      const CloudStorage = this.getStorage(input.storage);
      const storage = new CloudStorage();
      return storage.downloadFile(
        input.path, this.config.tempPath
      )
    });
  
    var downloadPromise = Promise.all(downloadTasks);

    this.on('kill', function() {
      let customError = new Error('Process is killed');
      customError.name = 'ProcessKilledError';
      let tempFiles = _.filter(
        data.input, input => input.storage !== 'local'
      ).map(input => {
        return {
          tempPath: this.config.tempPath + input.path.targetName
        }
      });
      downloadPromise = Promise.reject([customError, this, tempFiles]);
      downloadPromise.catch(([error, _this, tempFiles]) => {
        _this.emit('error', error);
        _this.unlinkFiles(tempFiles);
        throw error;
      }).catch(() => {});
    });
    
    return downloadPromise.then(() => data);
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
      command
        .on('end', (stdout, stderr) => resolve(result))
        .on('error', (error, stdout, stderr) => reject(result))
        .run();
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
    this
      .downloadInputFiles(data)
      .then(this.encode.bind(this))
      .then(this.uploadFiles.bind(this))
      .catch(result => {
        this.unlinkFiles(result);
      })
      .then(this.unlinkFiles)
      .catch(() => {});
    return this;
  }
}

module.exports = CloudFFmpeg;
