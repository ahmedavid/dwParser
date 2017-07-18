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

function scrape(url,lang) {
    xray(myencode(url),'body',
        {
            h1:'h1',
            asd:'.download > a@href',
            audioLink: '.overlayIcon > a@href | encode'

        })
    ((err, items) => {
        if(err) console.log(err);
        console.log(lang,items)
        xray(items.audioLink,'.mediaItem > input:nth-child(3)@value')(function (err, item) {
            console.log('MP3:',item)
        })
    });
}

scrape('http://www.dw.com/ru/урок-01-это-песня/a-269026','RU')
scrape("http://www.dw.com/tr/ders-01-bu-bir-%C5%9Fark%C4%B1/a-293588",'TR')
scrape("http://www.dw.com/es/lecci%C3%B3n-01-%C3%A9sa-es-una-canci%C3%B3n/a-352229",'ES')


