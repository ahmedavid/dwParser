const express = require('express');
const app = express();
const Xray = require('x-ray');
const fs = require('fs');
const xray = new Xray({
    filters:{
        trim: function (value) {
            return typeof value === 'string' ? value.trim() : value
        },
        extractTitle: function (value) {
            return typeof value === 'string' ? value.split("|")[1] : value
        },
        extractH2: function (value) {
            return typeof value === 'string' ? value.split("\n")[0] : value
        },
        encode: function (value) {
            return typeof value === 'string' ? encodeURI(value) : value
        }
    }
});


function myencode(value) {
    return typeof value === 'string' ? encodeURI(value) : value
}


const langs = [
    // {
    //     lang:"en",
    //     url:"http://www.dw.com/en/learn-german/deutsch-warum-nicht/s-2548"
    // },
    // {
    //     lang:"es",
    //     url:"http://www.dw.com/es/aprender-alemán/deutsch-warum-nicht/s-4642"
    // },
    // {
    //     lang:"tr",
    //     url:"http://www.dw.com/tr/almanca-öğrenin/deutsch-warum-nicht/s-2609"
    // },
    {
        lang:"ru",
        url:"http://www.dw.com/ru/учить-немецкий/deutsch-warum-nicht/s-2561"
    }
];

//Loop over array of languages
let countModules = 0;
langs.forEach(lang=>{
    xray(myencode(lang.url),{
        title:".news > h2 | extractTitle | trim",
        description:".news > .longText | trim",
        series:xray(".teaserContentWrap",[{
            title:"h2 | extractH2 | trim",
            url:"a@href | encode"
        }])
    })
    (function (err, modules) {
        if(err) console.log(err);

        //modules.series = modules.series.filter(module=>module.title && module.url)

        modules.lang = lang.lang;

        //console.log("MODULES:",modules)


        modules.series.forEach(serie => {

            //console.log("NEW SERIES:",module)
            xray(
                myencode(serie.url),
                '.intern',
                [{
                    title:'a | trim',
                    url:'a@href',
                    pdf: xray('a@href','.download > a@href'),
                    audioLink: xray('a@href','.overlayIcon > a@href')
                }]
            )((err, chapters) => {
                if(err) console.error(err);

                //items = items.filter(item => item.audioLink)
                //process.exit()
                serie.chapters = chapters;
                //console.log("ITEMS:",chapters);
                //console.log("MODULES:",modules)
            });
        });
        countModules++;
        if(countModules === modules.length){
            console.log("MODULES:",modules)
        }
    });
});

// xray(
//     myencode("http://www.dw.com/tr/almanca-öğrenin/deutsch-warum-nicht-1-bölüm/s-2607"),
//     '.intern',
//     [{
//         title:'a | trim',
//         url:'a@href',
//         pdf: xray('a@href','.download > a@href'),
//         audioLink: xray('a@href','.overlayIcon > a@href')
//     }]
// )((err, items) => {
//     if(err) console.error(err);
//
//     console.log("CHAPTERS:",items)
//
//
// });

// xray(myencode(langs[2].url),".teaserContentWrap",[{
//     series: {
//         title:"h2 | extractFirst | trim",
//         url: "a@href"
//     }
// }])
//     (function (err, lang) {
//         if(err) throw  err;
//
//         console.log(lang)
//     });

