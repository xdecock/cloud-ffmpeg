const data = {
  "input": [{
    "storage": "azure",
    "path": {
      "containerName": "videos",
      "blobName": "nature.mp4"
    },
    "ffmpegOptions": [
    ]
  }],
  "output": [{
    "storage": "azure",
    "path": {
      "containerName": "videos",
      "blobName": "nature2.mp4"
    },
    "ffmpegOptions": [
      "-f avi"
    ]
  }, {
    "storage": "azure",
    "path": {
      "containerName": "videos",
      "blobName": "nature3.mp4"
    },
    "ffmpegOptions": [
      "-f avi"
    ]
  }]
};

const CloudFFmpeg = require('../lib/cloud-ffmpeg');

let cloudFFmpeg = new CloudFFmpeg();
cloudFFmpeg.run(data).then((responses) => {
    console.log("Everything works well.");
    console.log(responses);
});
