const express = require('express');
const app = express();
const Xray = require('x-ray');
const fs = require('fs');
const xray = new Xray({
    filters:{
        trim: function (value) {
            return typeof value === 'string' ? value.trim() : value
        }
    }
});

const langModules = {
    en:[
        "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-1/s-2549",
        "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-2/s-2550",
        "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-3/s-2552",
        "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-4/s-2553"
    ],
    tr:[
        "http://www.dw.com/tr/almanca-%C3%B6%C4%9Frenin/deutsch-warum-nicht-1-b%C3%B6l%C3%BCm/s-2607",
        "http://www.dw.com/tr/almanca-%C3%B6%C4%9Frenin/deutsch-warum-nicht-2-b%C3%B6l%C3%BCm/s-2608",
        "http://www.dw.com/tr/almanca-%C3%B6%C4%9Frenin/deutsch-warum-nicht-3-b%C3%B6l%C3%BCm/s-2610",
        "http://www.dw.com/tr/almanca-%C3%B6%C4%9Frenin/deutsch-warum-nicht-4-b%C3%B6l%C3%BCm/s-2611"
    ]
};

const resultModules=[];

let k=0;
langModules.en.forEach(module=>{


    let chapters = [];

    xray(
        module,
        '.intern',
        [{
            title:'a | trim',
            url:'a@href',
            pdf: xray('a@href','.download > a@href'),
            audioLink: xray('a@href','.overlayIcon > a@href')
        }]
    )((err, items) => {
        if(err) throw err;
        chapters = items.filter(data=>{
            return data.audioLink
        });

        let j=0;

        chapters.forEach((element)=>{
            xray(element.audioLink,'.mediaItem > input:nth-child(3)@value')
            (function (err, item) {
                if(err) throw err;
                else if(item){
                    element.mp3=item;
                }
                else{
                    console.log("PANIC!!!!,Something Unexpected Happened!")
                }
                j++;
                if(chapters.length===j){
                    console.log("PUSHING")
                    resultModules.push(chapters)
                    console.log("K:",k)
                    k++;
                    if(k===langModules.en.length){
                        //console.log(resultModules)
                        fs.writeFile('results.json', JSON.stringify(resultModules), 'utf8', ()=>console.log("DONE"));
                    }
                }

            })
        });



    });




});

app.get("/",(req,res)=>{


    const langModules = [
        {
            en:[
                "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-1/s-2549",
                "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-2/s-2550",
                "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-3/s-2552",
                "http://www.dw.com/en/learn-german/deutsch-warum-nicht-series-4/s-2553"
            ]
        }
    ];

    const resultModules=[];

    let k=0;
    langModules[0].en.forEach(module=>{


        let chapters = [];

        xray(
            module,
            '.intern',
            [{
                title:'a | trim',
                url:'a@href',
                pdf: xray('a@href','.download > a@href'),
                audioLink: xray('a@href','.overlayIcon > a@href')
            }]
        )((err, items) => {
            if(err) throw err;
            chapters = items.filter(data=>{
                return data.audioLink
            });

            let j=0;

            chapters.forEach((element)=>{
                xray(element.audioLink,'.mediaItem > input:nth-child(3)@value')
                (function (err, item) {
                    element.mp3=item;
                    j++;
                    if(chapters.length===j){
                        console.log("PUSHING")
                        resultModules.push(chapters)
                        console.log("K:",k)
                        k++;
                        if(k===langModules[0].en.length){
                            console.log(resultModules)
                            res.json(resultModules)
                        }
                    }

                })
            });



        });


    });



});


const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log('Listening on port',port);
});