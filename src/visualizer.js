function TreeVisualizer(selector) {
    this.selector = selector
    this.el = $(this.selector)
    this.$ = function() {
        return this.el.children(arguments)
    }
    this.lastStopTime = null
}

TreeVisualizer.prototype.render = function(callgraph) {
    if(callgraph.stopTime == this.lastStopTime)
        return;
    this.lastStopTime = callgraph.stopTime
    
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

function FunVisualizer(selector) {
    this.selector = selector
    this.el = $(this.selector)
    this.$ = function() {
        return this.el.children(arguments)
    }
}

FunVisualizer.prototype.render = function(counts, times) {
    $("#counts").remove()
    this.el.append('<dl id="counts"></dl>')
    for(var c in counts)
        $("#counts").append("<dt>"+c+"</dt><dd>"+counts[c]+"</dd>")
    
    $("#times").remove()
    this.el.append('<ol id="times"></ol>')
}

function PathVisualizer(selector) {
    this.selector = selector
    this.el = $(this.selector)
    this.$ = function() {
        return this.el.children(arguments)
    }
}

PathVisualizer.prototype.render = function(paths) {
    this.$("ul").remove()
    this.el.append('<dl></dl>')
    var path_counts = count_uniq(paths)
    for(var p in path_counts) {
        this.$("dl").append("<dt>"+p+"</dt><dd>"+path_counts[p]+"</dd>")
    }
}
