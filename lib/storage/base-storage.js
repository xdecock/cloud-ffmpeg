const fs = require('fs');

class BaseStorage {
  constructor() {
    if (this.constructor === BaseStorage) {
      throw new Error('Cannot construct abstract class');
    }
  }

  downloadStream(storagePath) {
    throw new Error('Abstract method should not be called');
  }

  downloadFile(storagePath, tempPath) {
    throw new Error('Abstract method should not be called');
  }

  uploadStream(storagePath, stream) {
    throw new Error('Abstract method should not be called');
  }

  uploadFile(storagePath, tempPath) {
    throw new Error('Abstract method should not be called');
  }
}

module.exports = BaseStorage;
