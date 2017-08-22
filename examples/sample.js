const CloudFFmpeg = require('../lib/cloud-ffmpeg');
const fs = require('fs');

const json = fs.readFileSync('./sample.json');
const data = JSON.parse(json);

const config = {
  tempPath: '/tmp/'
};

const cloudFFmpeg = new CloudFFmpeg(config);

cloudFFmpeg.
  on('progress', progress => {
    console.log("Progress at " + Math.round(progress.percent) +"%!");
  }).run(data)
  .then((responses) => {
    console.log("Everything works well.");
  });
