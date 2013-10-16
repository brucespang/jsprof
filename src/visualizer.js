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

FunVisualizer.prototype.render = function(nodes) {
    this.$("ul").remove()
    this.el.append('<ul></ul>')
    nodes = nodes.sort(function(x,y) { return x.count - y.count }).reverse()
    for(var n in nodes) {
        var node = nodes[n]
        var li = $("<li></li>").appendTo(this.$("ul"))
        li.append("<strong>" + node.name + "</strong>")
        li.append("<dl><dt>Count:</dt><dd>"+node.count+"</dd><dt>Average:</dt><dd>"+ node.avg.toFixed(3) +"</dd><dt>90th Percentile:</dt><dd>"+ node.p90 +"</dd><dt>99th Percentile:</dt><dd>"+ node.p99 +"</dd></dl>")
    }
}

function PathVisualizer(selector) {
    this.selector = selector
    this.el = $(this.selector)
    this.$ = function() {
        return this.el.children(arguments)
    }
}

PathVisualizer.prototype.format = function(paths) {
    return paths.map(function(path) {
        return path.map(function(node){
            var name = node[0]
            var count = node[1]
            if(count > 1)
                return name + " ("+count+")"
            else
                return name
        }).join(', ')
    })
}

function count_uniq(xs) {
    var counts = {}
    for(var x in xs) {
        if(!counts[xs[x]])
            counts[xs[x]] = 0
        counts[xs[x]] += 1
    }
    return counts
}

function sort_object(obj, f) {
    var sortable = []
    for(var k in obj)
        sortable.push([k, obj[k]])
    return sortable.sort(function(x,y){ return f(x[1], y[1])})
}

PathVisualizer.prototype.render = function(paths) {
    this.$("dl").remove()
    this.el.append('<dl></dl>')
    var paths = this.format(paths)
    var path_counts = count_uniq(paths)
    var sorted = sort_object(path_counts, function(x,y) { return x-y }).reverse()
    for(var p in sorted) {
        var path = sorted[p]
        this.$("dl").append("<dt>"+path[0]+"</dt><dd>"+path[1]+"</dd>")
    }
}
