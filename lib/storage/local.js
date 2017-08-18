const fs = require('fs-extra');
const BaseStorage = require('./base-storage');

class LocalStorage extends BaseStorage {
  downloadStream(storagePath) {
    let path = storagePath.location + storagePath.targetName;
    return fs.createReadStream(path);
  }

  downloadFile(storagePath, tempPath) {
    return storagePath.location + storagePath.targetName;
  }

  createDirectoryIfNotExists(path) {
    return fs.ensureDir(path);
  }

  _uploadStream(storagePath, stream) {
    return new Promise((resolve, reject) => {
      fs.createWriteStream(storagePath)
        .on('error', (error) => {
          reject(error)
        });
      resolve();
    });
  }

  uploadStream(storagePath, stream) {
    let path = storagePath.location + storagePath.targetName;
    return this.createDirectoryIfNotExists(path)
      .then(() => this._uploadStream(path, stream));
  }

  _uploadFile(storagePath, tempPath) {
    return new Promise((resolve, reject) => {
      var readStream = fs.createReadStream(tempPath),
          writeStream = fs.createWriteStream(storagePath);
      readStream.pipe(writeStream)
        .on('end', resolve())
        .on('error', (error) => {
          reject(error)
        });
    });
  }

  uploadFile(storagePath, tempPath) {
    let path = storagePath.location + storagePath.targetName;
    return this.createDirectoryIfNotExists(storagePath.location)
      .then(() => this._uploadFile(path, tempPath));
  }
}

module.exports = LocalStorage;
