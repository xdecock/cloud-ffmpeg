const azure = require('azure-storage');

class AzureStorage {

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
  
  downloadStream(path) {
    return this._blobService.createReadStream(
      path.containerName,
      path.blobName,
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
  
  uploadStream(path, stream) {
    const streamLength = 100 * 1024 * 1024;
    const uploadOptions = {};
    return new Promise((resolve, reject) => {
      this._blobService.createBlockBlobFromStream(
        path.containerName,
        path.blobName,
        stream,
        streamLength,
        uploadOptions,
        this.uploadStreamResponse(resolve, reject)
      );
    });
  }
}

module.exports = AzureStorage;
