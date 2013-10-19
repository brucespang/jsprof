function clickLineLink(e){
    e.preventDefault();

    var linenum = $(this).attr("href").replace("#", "")
    $("form#src .lineselect").removeClass("lineselect")
    $("form#src .lineno-"+linenum).addClass("lineselect")
}

String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function TreeVisualizer(selector) {
    this.selector = selector
    this.el = $(this.selector)
    this.$ = function() {
        return this.el.children(arguments)
    }
    this.lastStopTime = null
}

TreeVisualizer.prototype.updateNode = function(graph, node) {
    if(graph.find("#node-"+node.id).length == 0)
        this.addNode(graph, node)
    
    var el = graph.find("#node-"+node.id)
    el.find(".time").text('('+ (node.stopTime - node.startTime)+' ms)')
    for(var c in node.children)
        if(el.children("ol"))
            this.updateNode(el.children("ol"), node.children[c])
}

TreeVisualizer.prototype.addNode = function(graph, node) {
    var li = $('<li id="node-'+node.id+'"></li>').appendTo(graph)
    var p = $('<p></p>').appendTo(li)
    if(node.children.length > 0)
        p.append("<a class='node-name' href='#'>"+node.name+"</a>")
    else
        p.append(node.name)
    p.append('<a href="#'+node.line+'" class="line-link">(line '+node.line+')</a>')
    p.append(' <span class="time"></span>')

    p.children('.line-link').on('click', clickLineLink)

    var self = this
    li.find("a.node-name").click(function() {
        if(li.children("ol").length == 0) {
            var children = $("<ol></ol>").appendTo(li)
            for(var c in node.children) {
                self.updateNode(children, node.children[c])
            }
        } else {
            li.children("ol").toggle()
        }
    })
}

TreeVisualizer.prototype.render = function(callgraph) {
    if(callgraph.stopTime == this.lastStopTime)
        return;
    this.lastStopTime = callgraph.stopTime

    this.updateNode($("#callgraph"), callgraph)
    if($("#node-0 ol").length == 0)
        $("#node-0 p a:first").trigger('click')
}

TreeVisualizer.prototype.reset = function() {
    $("#callgraph").html('')
}

function FunVisualizer(selector) {
    this.selector = selector
    this.el = $(this.selector)
    this.$ = function() {
        return this.el.children(arguments)
    }
}

FunVisualizer.prototype.reset = function() {
    this.el.find('ul').remove()
}

FunVisualizer.prototype.render = function(nodes) {
    if(this.el.find('ul').length == 0)
        this.el.append('<ul></ul>')

    nodes = nodes.sort(function(x,y) { return x.count - y.count }).reverse()
    for(var n in nodes) {
        var stats = nodes[n]
        var node = stats.node

        var name = node.name.hashCode()

        $("#fun-node-"+name).remove()

        var li = $("<li id='fun-node-"+name+"'></li>").appendTo(this.el.find("ul"))
        li.append("<strong>" + node.name + "</strong>")
        li.append("<a class='line-link' href='#"+node.line+"'>line "+node.line+"</a></dd>")
        li.children(".line-link").on('click', clickLineLink)

        var dl = $("<dl></dl>").appendTo(li)
        dl.append("<dt>count</dt><dd>"+stats.count+"</dd>")
        dl.append("<dt>latency graph</dt><dd class='graph'><span></span></dd>")
        dl.append("<dt>average latency</dt><dd>"+ stats.avg.toFixed(3) +" ms</dd>")
        dl.append("<dt>90th percentile</dt><dd>"+ stats.p90 +" ms</dd>")
        dl.append("<dt>99th percentile</dt><dd>"+ stats.p99 +" ms</dd>")
        
        dl.find(".graph span").sparkline(stats.times, {type: 'box'})
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
