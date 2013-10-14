var tree = new TreeVisualizer("#tree")
setInterval(function() {
    if(!$("#tree").is(":visible"))
        return

    tree.render(window.profiler.callgraph())
}, 250)

var funs = new FunVisualizer("#funs")
setInterval(function() {
    if(!$("#funs").is(":visible"))
        return;

    funs.render(window.profiler.counts(), window.profiler.times())
}, 250)

var paths = new PathVisualizer("#paths")
setInterval(function() {
    if(!$("#paths").is(":visible"))
        return;

    paths.render(window.profiler.paths())
}, 250)

$("#nav a").click(function(e) {
    e.preventDefault()
    
    var id = $(this).attr("href")
    $("#nav .disabled").removeClass("disabled btn-primary")
    $(this).addClass("disabled btn-primary")
    $("#report .section").hide()
    $(id).show()

})

$("#tree").show().toggleClass("active")
$("#funs").hide()
$("#paths").hide()

function loadScript(url) {
    $.get(url, function(){}, "html").then(function(code){
        $("#javascript-src").text(code)
    }, function(err) {
        console.log("ERROR", err)
    })
}

$("#sample").change(function() {
    var url = $(this).find("option:selected").attr("value")
    if(!url)
        return
   loadScript(url)
})
loadScript($("#sample option:first").val())

$("form#src").submit(function(e) {
    e.preventDefault()
    
    var src = $("#javascript-src").text()
    var code = window.profiler.instrument(src)
    console.log(code)
    eval(code)
})

