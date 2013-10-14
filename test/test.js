function fact(n) {
    if(n <= 0)
        return 1
    else
        return n*fact(n-1)
}

function bar() {
    for(var i = 0; i < 4; i++)
        fact(i)
}

function exception() {
    throw "error"
}

var test = function() {
    console.log("test")
    exception()
    fact(3)
}
      
function foo() {
    bar()
}

foo()
try {
    test()
} catch(e) {
    console.log("caught", e)
    fact(3)
}

setInterval(function() {
    fact(100)
}, 1000)
