const yama = require('./')
const url = 'http://youtube.com/watch?v=BJ0xBCwkg3E'
const decoder = require('lame').Decoder
const speaker = require('speaker')

// URL of youtube video, 
// time to begin from (nullable),
// desired duration (nullable), 
// desired bitrate (nullable)
// desired format
// channel count (nullable)

yama(url, "0:10", 20, 4, "mp3", 2)
.pipe(decoder())
.pipe(speaker())
