const express = require('express');
const app = express();
const Xray = require('x-ray');
const fs = require('fs');
const xray = new Xray({
    filters:{
        trim: function (value) {
            return typeof value === 'string' ? value.trim() : value
        },
        encode: function (value) {
            return typeof value === 'string' ? encodeURI(value) : value
        }
    }
});


function myencode(value) {
    return typeof value === 'string' ? encodeURI(value) : value
}

xray(myencode('http://www.dw.com/ru/урок-01-это-песня/a-269026'),'body',
    {
        h1:'h1',
        asd:'.download > a@href',
        audioLink: '.overlayIcon > a@href | encode'

    })
    ((err, items) => {
        if(err) console.log(err);
        console.log(items)
        xray(items.audioLink,'.mediaItem > input:nth-child(3)@value')(function (err, item) {
            console.log('MP3:',item)
        })
    });


