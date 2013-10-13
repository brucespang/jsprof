$.get("/src/test.js", function(){}, "html").then(function(code){
    var profiled = Profiler.instrument(code)
    console.log(profiled)
    eval(profiled)
    console.log(Profiler.paths())
    console.log(count_uniq(Profiler.paths()))
    console.log(Profiler.nodes())
    console.log(count_uniq(Profiler.nodes()))
}, function(err) {
    console.log("ERROR", err)
})
