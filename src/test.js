function fact(n) {
    if(n <= 0)
        return 1
    else
        return n*fact(n-1)
}

function bar() {
    for(var i = 0; i < 4; i++)
        console.log(fact(i))
}

function exception() {
    throw "error"
}

var test = function() {
    console.log("test")
    exception()
}
      
function foo() {
    bar()
}

foo()
try {
    test()
} catch(e) {
    console.log("caught", e)
}
