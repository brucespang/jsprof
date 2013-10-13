$.get("/src/test.js", function(){}, "html").then(function(code){
    var profiled = Profiler.instrument(code)
    console.log(profiled)
    eval(profiled)
}, function(err) {
    console.log("ERROR", err)
})
