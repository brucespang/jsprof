function spin(n) {
    if(n == 1)
        return
    else
        return spin(n-1)
}

function exception() {
    throw "error"
}

function test() {
    // should be called once
    for(var i = 0; i < 10; i++)
        exception()
    // should not be called
    spin(3)
}

try {
    test()
} catch(e) {
    console.log("caught", e)
    spin(3)
} finally {
    spin(4)
}

try {
    console.log("ok")
} finally {
    spin(4)
}

setInterval(function() {
    try {
        test()
    } catch(e) {
        console.log("caught", e)
        spin(3)
    }
}, 1000)
