const yama = require('./')
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
