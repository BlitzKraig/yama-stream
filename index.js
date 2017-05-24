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

function streamify(uri, timestampstart, audioduration, audioBitrate, format, audiochannels, opt) {
    opt = xtend({
        audioBitrate: audioBitrate,
        filter: 'audioonly',
        quality: 'lowest',
        audioFormat: format,
        startTime: timestampstart,
        duration: audioduration,
        channels: audiochannels,
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
                return 99999999999;
            }
        }else{
            return 99999999999;
        }
    }
    
    function getChannels() {
        if(opt.channels != null){
            if(opt.channels >= 1 && opt.channels <= 2){
                // Only allowing mono/stereo, should maybe make this a bool
                return opt.channels;
            }else{
                return 1;
            }
        }else{
            return 1;
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
    var ffmpeg = new FFmpeg(audio)
    if(startTime() != null){
        ffmpeg.seekInput(startTime());
    }
    if(getDuration() != null){
        ffmpeg.duration(getDuration());
    }
    if(getFormat() == "s16le"){
        ffmpeg.audioFrequency(100000 / getChannels());
    }
        ffmpeg.noVideo();
        ffmpeg.audioQuality(bitrate());
        ffmpeg.audioChannels(getChannels());
        ffmpeg.renice(-20);
    

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
