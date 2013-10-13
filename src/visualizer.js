function Visualizer(selector) {
    this.selector = selector
    this.el = $(this.selector)
    this.$ = function() {
        return this.el.children(arguments)
    }
}

Visualizer.prototype.callgraph = function(callgraph) {
    $("#callgraph").remove()
    this.el.append('<ol id="callgraph"></ol>')

    function addNode(graph, node, depth) {
        if(depth > 10) {
            $("<li><p>...</p></li>").appendTo(graph)
            return
        }
        
        var li = $("<li></li>").appendTo(graph)
        li.append("<p>"+node.name+" ("+ (node.stopTime - node.startTime)+" ms)</p>")
        var children = $("<ol></ol>").appendTo(li)
        for(var c in node.children)
            addNode(children, node.children[c], depth + 1)
    }
    
    addNode($("#callgraph"), callgraph, 0)
}

visualizer = new Visualizer("#visualizer")
setInterval(function() {
    visualizer.callgraph(Profiler.callgraph())
}, 1000)
