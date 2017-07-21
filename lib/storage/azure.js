const azure = require('azure-storage');
const BaseStorage = require('./base-storage');

class AzureStorage extends BaseStorage {
  constructor() {
    this._blobService = azure.createBlobService();
  }

  downloadStreamResponse(error, result, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(result);
    }
  }

  downloadStream(storagePath) {
    return this._blobService.createReadStream(
      storagePath.location,
      storagePath.targetName,
      this.downloadStreamResponse
    );
  }

  uploadStreamResponse(resolve, reject) {
    return (error, result, response) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log(result);
        resolve(result);
      }
    };
  }

  createContainerIfNotExists(containerName) {
    return new Promise((resolve, reject) => {
      this._blobService.createContainerIfNotExists(
        containerName,
        { publicAccessLevel: null },
        this.uploadStreamResponse(resolve, reject)
      );
    });
  }

  _uploadStream(cloudPath, stream) {
    const streamLength = 4 * 1024 * 1024;
    const uploadOptions = {};
    return new Promise((resolve, reject) => {
      this._blobService.createBlockBlobFromStream(
        cloudPath.location,
        cloudPath.targetName,
        stream,
        streamLength,
        uploadOptions,
        this.uploadStreamResponse(resolve, reject)
      );
    });
  }

  uploadStream(storagePath, stream) {
    return this.createContainerIfNotExists(storagePath.location)
      .then(this._uploadStream(storagePath, stream));
  }

  _uploadFile(cloudPath, localPath) {
    const streamLength = 4 * 1024 * 1024;
    const uploadOptions = {};
    return new Promise((resolve, reject) => {
      this._blobService.createBlockBlobFromLocalFile(
        cloudPath.location,
        cloudPath.targetName,
        localPath,
        uploadOptions,
        this.uploadStreamResponse(resolve, reject)
      );
    });
  }

  uploadFile(storagePath, tempPath) {
    return this.createContainerIfNotExists(storagePath.location)
      .then(this._uploadFile(storagePath, tempPath));
  }
}

module.exports = AzureStorage;
