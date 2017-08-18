Cloud FFmpeg
====================================

`cloud-ffmpeg` is a Node.js module intended to serve as a pipeline to `FFMPEG` 
via [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg), 
supporting various storages (e.g. local storage, Microsoft Azure).


[![npm Package](https://img.shields.io/npm/v/cloud-ffmpeg.svg?style=flat-square)](https://www.npmjs.org/package/cloud-ffmpeg)

Requirements
------------

- `Node.js` 6.9.1 (or later)
- `fluent-ffmpeg` 2.1.0 (or later)
- and more specified in [package.json](package.json) under dependencies

Installation
------------

Install with `npm`:

    npm install --save cloud-ffmpeg


Usage
-----------------

First install dependencies via `npm`:

    cd /path/to/cloud-ffmpeg
    npm install

`cloud-ffmpeg` takes 2 inputs specified with options `-t` / `--temp-path` and 
`-d` / `--data-path`. `--temp-path` should be a path to a temporary directory 
which will be used by `FFMPEG` to temporarily store the output. If a directory 
doesn't exist in the specified path, it will be created. `--temp-path` will 
default to `/tmp` if not specified. `--data-path` should be a path to a json 
file which contains the details for `FFMPEG`. The json file is comprised of
3 keys of `"task"`, `"input"`, and `"output"`. `"task"` simply declares the type
of the task, `"ffmpeg"`. `"input"` and `"output"` are arrays of objects with 
relevant data for `FFMPEG`. Each object in `"input"` and `"output"` should 
contain keys `"storage"`, `"path"`, and `"ffmpegOptions"`. `"storage"` should be 
the type of storage where the file or blob is located at (e.g. "azure"). 
`"path"` should have `"location"` of the file or blob (directory for local or 
name of container for cloud storage) and `"targetName"` for name of the file 
or blob. `"ffmpegOptions"` should be an array of strings containing `FFMPEG` 
options. To get an idea of how the json file should look like, please refer to 
[sample.json](examples/sample.json) or [local-sample.json](examples/local-sample.json).

To execute, in any shell or terminal emulator:

    cloud-ffmpeg -t /path/to/tmp/dir -d /path/to/data-file.json
    

Dockerfile
-----------------

Dockerfile to build Docker image is included in this repository. The image is
based on Alpine Linux 3.4 and includes FFmpeg v3.3.3 and node.js v6.11.2 and 
necessary dependencies to build them. For build instructions, refer to 
[Dockerfile reference](https://docs.docker.com/engine/reference/builder/) from 
the Docker docs.


License
-------

Copyright (c) 2017, TNTcrowd Co., Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
