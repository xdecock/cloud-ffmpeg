const FFmpegCommand = require('fluent-ffmpeg');
const PassThrough = require('stream').PassThrough;

class CloudFFmpeg {

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
    return new FFmpegCommand()
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
    let stream = new PassThrough();
    command
      .clone()
      .output(stream)
      .outputOptions(options)
      .run();
    return storage.uploadStream(source.path, stream);
  }

  run(data) {
    let command = this.createFFmpegCommand();
    command = data.input.reduce(
      this.addInput.bind(this),
      command
    );
    return Promise.all(data.output.map((source) => {
      return this.addOutput.bind(this)(command, source);
    }));
  }
}

module.exports = CloudFFmpeg;
