var ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');
var through = require('through2');
var xtend = require('xtend');
var fs = require('fs');

var defaultAudioBitrate = 5;
var minAudioBitrate = 0;
var maxAudioBitrate = 9;

var defaultFormat = "mp3";

var isYT = false;

function streamify(uri, timestampstart, audioduration, audioBitrate, format, opt) {
    opt = xtend({
        audioBitrate: audioBitrate,
        filter: 'audioonly',
        quality: 'lowest',
        audioFormat: format,
        startTime: timestampstart,
        duration: audioduration,
        applyOptions: function () {}
    }, opt);


    var audio;



    function startTime() {
        if (opt.startTime != null) {
            var isValid = /^(?:(\d{1,2}):)?(\d{1,2}:)?(\d{2})$/.test(opt.startTime);
            if(isValid){
                return opt.startTime;
            }else{
                return null;
            }
        } else {
            return null;
        }
    }

    function getDuration() {
        if(opt.duration != null){
            if(opt.duration > 0){
                return opt.duration;
            }else{
                return Number.MAX_SAFE_INTEGER;
            }
        }else{
            return Number.MAX_SAFE_INTEGER;
        }
    }

    function bitrate() {
        if (opt.audioBitrate != null) {
            console.log("Submitted bitrate: " + opt.audioBitrate);
            if (opt.audioBitrate >= minAudioBitrate && opt.audioBitrate <= maxAudioBitrate) {
                return opt.audioBitrate;
            } else {
                console.log("Ignoring submitted bitrate, using default");
                return defaultAudioBitrate;
            }
        } else {
            return defaultAudioBitrate;
        }
    }

    function getFormat() {
        if(opt.audioFormat != null){
            return opt.audioFormat;
        }else{
            return defaultFormat;
        }
    }



    if(uri.lastIndexOf("aud:", 0) === 0){
        //This is an audio file request
        audio = uri.substring(4);

    }else{
        isYT = true;
        audio = ytdl(uri, {filter: opt.filter, quality: opt.quality});
    }


    var stream = opt.file
    ? fs.createWriteStream(opt.file)
    : through();

    //Hacky horrid fix for no starttime... Setting to 0 causes timing issues
    if(startTime() != null){
        var ffmpeg = new FFmpeg(audio)
        .seekInput(startTime())
        .duration(getDuration())
        .noVideo()
        .audioQuality(bitrate())
        .audioChannels(1)
        .renice(-20);
    }else{
        var ffmpeg = new FFmpeg(audio)
        .noVideo()
        .duration(getDuration())
        .audioQuality(bitrate())
        .audioChannels(1)
        .renice(-20);
    }

    opt.applyOptions(ffmpeg);
    var output = ffmpeg
    .format(getFormat())
    .pipe(stream);
    if(isYT){
        output.on('error', audio.end.bind(audio));
    }
    output.on('error', stream.emit.bind(stream, 'error'));
    return stream;


}

module.exports = streamify;
