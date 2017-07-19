const fs = require('fs');
const Xray = require('x-ray');
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


async function aXray(url,scope,selector){
    return new Promise(function (resolve, reject) {
        if(scope){
            xray(myencode(url),scope,selector)(function (err, result) {
                if(err) reject(err);
                else{
                    resolve(result);
                }
            })
        }
        else{
            xray(myencode(url),selector)(function (err, result) {
                if(err) reject(err);
                else{
                    resolve(result);
                }
            })
        }
    })
}

async function fetchMP3(url) {
    return await aXray(url,null,".mediaItem > input:nth-child(3)@value")
}

async function fetchMedia(url) {
    let media=await aXray(url,null,
        {
                pdf:'.download > a@href',
                audioLink: '.overlayIcon > a@href | encode'
        });
    if(media.audioLink){
        media.mp3 = await fetchMP3(media.audioLink);
    }
    else{
        return false;
    }
    return media;
}

async function fetchChapters(url) {
    let chapters=await aXray(url,'.intern',
            [{
                title:'a | trim',
                url:'a@href'
            }]);
    for(let i=0;i<chapters.length;i++){
        let mediaResult=await fetchMedia(chapters[i].url);
        if(mediaResult){
            chapters[i].media=mediaResult;
        }
    }

    return chapters
}

async function fetchSeries(url) {
    let series = await aXray(url,{
        title:".news > h2 | extractTitle | trim",
        description:".news > .longText | trim",
        series:xray(".teaserContentWrap",[{
            title:"h2 | extractH2 | trim",
            url:"a@href | encode"
        }])
    });
    for(let i=0;i<4;i++){
        console.log(series.series[i])
        let chapters = await fetchChapters(series.series[i].url);
        if(chapters){
            series.series[i].chapters=chapters;
        }
    }

    return series;
}

//fetchSeries("http://www.dw.com/en/learn-german/deutsch-warum-nicht/s-2548")
(async function () {
    //let print = await fetchChapters("http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-1/s-2549");
    //let print = await fetchSeries("http://www.dw.com/en/learn-german/deutsch-warum-nicht/s-2548");
    let print = await fetchSeries("http://www.dw.com/ru/%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D0%BD%D0%B5%D0%BC%D0%B5%D1%86%D0%BA%D0%B8%D0%B9/deutsch-warum-nicht/s-2561");
    console.log(print)
    fs.writeFile(
        'async.json',
        JSON.stringify(print),
        'utf8',
        ()=>console.log("DONE")
    );
})();
// xray(myencode("http://www.dw.com/en/learn-german/deutsch-warum-nicht/s-2548"),{
//     title:".news > h2 | extractTitle | trim",
//     description:".news > .longText | trim",
//     series:xray(".teaserContentWrap",[{
//         title:"h2 | extractH2 | trim",
//         url:"a@href | encode"
//     }])
// })
// (function (err, modules) {
//     console.log(modules)
// })



// function fetchMedia(url) {
//     return new Promise(function (resolve, reject) {
//         xray(myencode(url),
//             {
//                 pdf:'.download > a@href',
//                 audioLink: '.overlayIcon > a@href | encode'
//
//             })
//         ((err, items) => {
//             if(err) console.log(err);
//             xray(items.audioLink,'.mediaItem > input:nth-child(3)@value')
//             (function (err, item) {
//                 if(err) reject(err);
//                 items.mp3=item;
//                 //console.log("ITEM:",items)
//                 //process.exit()
//                 resolve(items)
//                 //console.log('MP3:',item)
//             })
//         });
//     })
// }
//
// function fetchChapters(chapters){
//     return new Promise(function (resolve, reject) {
//         chapters.forEach(async (chapter,index)=>{
//             try {
//                 let media= await fetchMedia(chapter.url);
//                 console.log(media)
//                 chapter.mp3=media.mp3;
//                 chapter.pdf=media.pdf;
//             }
//             catch (err){
//                 reject(err)
//             }
//
//             if(index===chapters.length-1){
//                 console.log("IF RAN")
//                 resolve(chapters)
//             }
//         });
//     })
// }
//
// function fetchSeries(serie) {
//     return new Promise(function (resolve, reject) {
//         xray(
//             myencode(serie.url),
//             '.intern',
//             [{
//                 title:'a | trim',
//                 url:'a@href',
//                 //pdf: xray('a@href','.download > a@href'),
//                 //audioLink: xray('a@href','.overlayIcon > a@href')
//             }]
//         )(async (err, chapters) => {
//             if(err) reject(err);
//             else {
//                 resolve(await fetchChapters(chapters))
//             }
//         });
//     })
// }
//
// const langs = [
//     {
//         lang:"en",
//         url:"http://www.dw.com/en/learn-german/deutsch-warum-nicht/s-2548"
//     },
//     // {
//     //     lang:"es",
//     //     url:"http://www.dw.com/es/aprender-alemán/deutsch-warum-nicht/s-4642"
//     // },
//     // {
//     //     lang:"tr",
//     //     url:"http://www.dw.com/tr/almanca-öğrenin/deutsch-warum-nicht/s-2609"
//     // },
//     // {
//     //     lang:"ru",
//     //     url:"http://www.dw.com/ru/учить-немецкий/deutsch-warum-nicht/s-2561"
//     // }
// ];
//
// function fetchModules() {
//     langs.forEach(lang=>{
//         xray(myencode(lang.url),{
//             title:".news > h2 | extractTitle | trim",
//             description:".news > .longText | trim",
//             series:xray(".teaserContentWrap",[{
//                 title:"h2 | extractH2 | trim",
//                 url:"a@href | encode"
//             }])
//         })
//         (function (err, modules) {
//             if(err) console.log("ERROR:",err);
//             modules.lang = lang.lang;
//             let i=0;
//             (async function () {
//                 modules.series.forEach(async serie => {
//                     try{
//                         serie.chapters = await fetchSeries(serie);
//                         i++;
//                         // fs.writeFile(
//                         //     'async.json',
//                         //     JSON.stringify(resultModules),
//                         //     'utf8',
//                         //     ()=>console.log("DONE")
//                         // );
//                         //console.log("RESULT "+i,chapters)
//                     }
//                     catch (err){
//                         console.log("FUCKING ERROR:",err);
//                     }
//                 });
//             })()
//             console.log("MODULES:",modules)
//         })
//     });
// }
//
// fetchModules();


//
// function delayIt() {
//     return new Promise(function (resolve, reject) {
//         setTimeout(function () {
//             if(Math.round(Math.random())){
//                 resolve("RESPONSE")
//             }
//             else {
//                 //reject("ERROR")
//                 resolve("ERROR")
//             }
//
//         },1500)
//     });
// }
//
//
// async function foo() {
//     try {
//         const result1 = await delayIt()
//         console.log(result1)
//         const result2 = await delayIt()
//         console.log(result2)
//         const result3 = await delayIt()
//         const result4 = await delayIt()
//         const result5 = await delayIt()
//
//
//
//         console.log(result3)
//         console.log(result4)
//         console.log(result5)
//     }
//     catch (err){
//         console.error("PANIC: ",err)
//     }
// }
//
// foo();
