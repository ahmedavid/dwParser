var express = require('express');
var app = express();
var Xray = require('x-ray');
var xray = new Xray({
    filters:{
        trim: function (value) {
            return typeof value === 'string' ? value.trim() : value
        }
    }
});


var chapters = [];
var resultChapters = [];
var tempChapter = {};
xray(
    'http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-1/s-2549',
    '.intern',
    [{
        title:'a | trim',
        url:'a@href',
        pdf: xray('a@href','.download > a@href'),
        audioLink: xray('a@href','.overlayIcon > a@href')
    }]
    )(function (err, items) {
        if(err) console.log('ERROR:',err);
        chapters = items;
        //console.log(items);


        for(var i=0;i<chapters.length;i++){
            //console.log(chapters[i].audioLink)
            tempChapter = chapters[i];
            if(chapters[i].audioLink){
                xray(chapters[i].audioLink,'.mediaItem > input:nth-child(3)@value')
                (function (err, item) {
                    if(err) console.log('ERROR:',err);
                    console.log('MP3:',item);

                    tempChapter.mp3 = item;
                    //console.log('CHAPTER:',tempChapter);
                    resultChapters.push(tempChapter);
                    //console.log('RESULT2:',resultChapters)
                })
            }

        }
    })






var port = process.env.PORT || 3000;
app.listen(port,function(){
    console.log('Listening on port',port);
})