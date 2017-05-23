const yama = require('./')
const url = 'aud:./TestSounds/ooh.wav'
const decoder = require('lame').Decoder
const speaker = require('speaker')

// URL of youtube video, 
// time to begin from (nullable),
// desired duration (nullable), 
// desired bitrate (nullable)
yama(url, "0:00", 1, 2)
    .pipe(decoder())
    .pipe(speaker())
