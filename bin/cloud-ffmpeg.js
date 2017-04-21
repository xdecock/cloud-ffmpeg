#!/usr/bin/env node

const fs = require('fs');
const CloudFFmpeg = require('../lib/cloud-ffmpeg');

const args = process.argv.slice(2);

const getData = (args) => {
  if (args.length === 1) {
    const dataPath = args[0];
    const json = fs.readFileSync(dataPath);
    return JSON.parse(json);
  }
  return undefined;
};

const data = getData(args);

const cloudFFmpeg = new CloudFFmpeg();
cloudFFmpeg.run(data).then((responses) => {
  console.log("Everything works well.");
  console.log(responses);
});
