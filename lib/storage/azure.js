const azure = require('azure-storage');

blobService = azure.createBlobService();

const azureRequestCallback = (error, result, response) => {
  if (error) {
    console.log(error);
  }
  console.log(result);
};

const downloadStream = (path) => {
  return blobService.createReadStream(
    path.containerName,
    path.blobName,
    azureRequestCallback
  );
};

const streamLength = 100 * 1024 * 1024;
const uploadOptions = {};
const uploadStream = (path, stream) => {
  blobService.createContainerIfNotExists(
    path.containerName, {
      publicAccessLevel: null
    }, azureRequestCallback
  );
  blobService.createBlockBlobFromStream(
    path.containerName,
    path.blobName,
    stream,
    streamLength,
    uploadOptions,
    azureRequestCallback
  );
};

module.exports = {
  downloadStream: downloadStream,
  uploadStream: uploadStream
};
