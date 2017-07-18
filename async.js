
function delayIt() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            if(Math.round(Math.random())){
                resolve("RESPONSE")
            }
            else {
                //reject("ERROR")
                resolve("ERROR")
            }

        },1500)
    });
}


async function foo() {
    try {
        const result1 = await delayIt()
        console.log(result1)
        const result2 = await delayIt()
        console.log(result2)
        const result3 = await delayIt()
        const result4 = await delayIt()
        const result5 = await delayIt()



        console.log(result3)
        console.log(result4)
        console.log(result5)
    }
    catch (err){
        console.error("PANIC: ",err)
    }
}

foo();
