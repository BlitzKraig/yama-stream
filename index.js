var ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');
var through = require('through2');
var xtend = require('xtend');
var fs = require('fs');

var defaultAudioBitrate = 128;
var minAudioBitrate = 8;
var maxAudioBitrate = 256;

function streamify(uri, timestampstart, audioduration, audioBitrate, opt) {
    opt = xtend({
        audioBitrate: audioBitrate,
        filter: 'audioonly',
        quality: 'lowest',
        audioFormat: 'mp3',
        startTime: timestampstart,
        duration: audioduration,
        applyOptions: function () {}
    }, opt);

    var video = ytdl(uri, {filter: opt.filter, quality: opt.quality});

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
                return 9999999999;
            }
        }else{
            return 9999999999;
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

    var stream = opt.file
    ? fs.createWriteStream(opt.file)
    : through();

    //Hacky horrid fix for no starttime...
    if(startTime() != null){
        var ffmpeg = new FFmpeg(video)
        .seekInput(startTime())
        .duration(getDuration())
        .noVideo()
	.audioQuality(8)
	.audioChannels(1)
        .renice(-20);
    }else{
        var ffmpeg = new FFmpeg(video)
        .noVideo()
        .duration(getDuration())
	.audioQuality(8)
	.audioChannels(1)
        .renice(-20);
    }

    opt.applyOptions(ffmpeg);
    var output = ffmpeg
    .format(opt.audioFormat)
    .pipe(stream);

    output.on('error', video.end.bind(video));
    output.on('error', stream.emit.bind(stream, 'error'));
    return stream;
}

module.exports = streamify;