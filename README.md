# yama-stream

Youtube & MP3 Audio Streamer, created for use with my Discord bot.

## Getting Started

```
npm install --save yama-stream
var yama = require('yama-stream')
```

### Prerequisites

FFMPEG required

### Usage


## Node example playing directly to speaker
```js
const yama = require('yama-stream')
const url = 'http://youtube.com/watch?v=2JVwo3D72cc'
const decoder = require('lame').Decoder
const speaker = require('speaker')

// URL of youtube video, 
// time to begin from (nullable),
// desired duration (nullable), 
// desired bitrate (nullable)
yama(url, "0:10", 10, 128)
.pipe(decoder())
.pipe(speaker())
```

## Acknowledgments

* Based on [youtube-audio-stream](https://www.npmjs.com/package/youtube-audio-stream)