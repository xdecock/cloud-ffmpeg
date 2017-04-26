#!/usr/bin/env node

const program = require('commander');

const fs = require('fs');
const CloudFFmpeg = require('../lib/cloud-ffmpeg');

program
    .option(
        '-t, --temp-path [path]',
        'local path for temporarily saving ffmpeg output. defaults to /tmp/',
        '/tmp/'
    )
    .option('-d, --data-path <path>', 'json-formatted data path')
    .parse(process.argv);

const config = {
  tempPath: program.tempPath
};
const json = fs.readFileSync(program.dataPath);
const data = JSON.parse(json);

const cloudFFmpeg = new CloudFFmpeg(config);
cloudFFmpeg.run(data).then((responses) => {
  console.log("Everything works well.");
  console.log(responses);
});
