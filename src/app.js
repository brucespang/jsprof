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

    funs.render(window.profiler.node_stats())
}, 250)

function collapse(paths) {
    return paths.map(function(path) {
        return path.reduce(function(acc, node) {
            if(acc.length > 0 && acc[acc.length-1][0] == node)
                acc[acc.length-1][1] += 1
            else
                acc.push([node, 1])
            return acc
        }, [])
    })
}

var paths = new PathVisualizer("#paths")
setInterval(function() {
    if(!$("#paths").is(":visible"))
        return;

    var collapsed = collapse(window.profiler.paths())
    paths.render(collapsed)
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
$("#instrumented").hide()

function loadScript(url, cb) {
    $.get(url, function(){}, "html").then(function(code){
        $("#javascript-src").val(code)
        if(cb)
            cb()
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

$("form#src textarea").linedtextarea()
$("body").delegate('a.line-link', 'click', function(e){
    e.preventDefault();
    
    var linenum = $(this).attr("href").replace("#", "")
    $("form#src .lineselect").removeClass("lineselect")
    $("form#src .lineno-"+linenum).addClass("lineselect")
})

$("form#src").submit(function(e) {
    e.preventDefault()
    
    var src = $("#javascript-src").val()

    window.profiler = Profiler()
    tree.reset()
    funs.reset()
    
    var code = window.profiler.instrument(src)
    $("#instrumented pre").removeClass("prettyprinted")
    $("#instrumented pre").text(code)
    prettyPrint()
    eval(code)
})

loadScript($("#sample option:first").val(), function() {
    $("form#src").trigger("submit")    
})

