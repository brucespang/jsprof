var Profiler = function() {
    var callgraph = {
        name: "root",
        startTime: Date.now(),
        children: []
    }
    callgraph.prev = {children: [callgraph]}
    var currentCall = callgraph
    var counts = {}

    var id = 0

    function parse(code) {
        return UglifyJS.parse(code).body[0]
    }
    
    function beforeVisitor(node, descend) {
        if(node instanceof UglifyJS.AST_Lambda) {
            descend(node, this)
            
            if(node.name)
                var name = node.name.name
            else
                var name = "[Anonymous]"

            node.body.unshift(parse("window.profiler.enter('"+name+"', this)"))
            node.body.push(parse("window.profiler.exit()"))

            node.start = node.body[0]
            node.end = node.body[node.body.length-1]

            return node
        } else if(node instanceof UglifyJS.AST_Exit) {
            // we want to ensure that the last effective statement in every
            // function is Profiler.exit(). This code generates a block that
            // replaces an exit value in a way that guarantees that exit() is the
            // last call in the function. e.g.:
            //   return "a" -> return (function(){
            //                           var res_1 = "a"
            //                           window.profiler.exit();
            //                           return res_1})()
            //   return long_function() -> return (function(){
            //                                       var res_2 = long_function();
            //                                       window.profiler.exit();
            //                                       return res_2})()
            descend(node, this)
            
            var name = Symbol("res_" + id)
            id += 1

            node.value = Apply(Dot(Seq(Lambda([Assign(name, node.value),
                                               parse("window.profiler.exit()"),
                                               Return(name)],
                                              []),
                                      null),
                                  "call"),
                              [parse("this").body])

            return node
        } else if(node instanceof UglifyJS.AST_Call) {
            // we want to wrap all function calls in try/catch blocks so that if
            // an exception is thrown in the function, we can exit out of the
            // current function in the profiler before propagating the exception
            // we need to wrap it in apply/lambda/return in case the programmer
            // wants to do something insane like store the result of a
            // function call.
            descend(node, this)

            var apply =  Apply(Dot(Seq(Lambda([Try([Return(node)],
                                                   [parse("window.profiler.exit()"),
                                                    parse("throw e")])],
                                              []),
                                       null),
                                   "call"),
                               [parse("this").body])
            
            return apply
        } else if(node instanceof UglifyJS.AST_Catch || node instanceof UglifyJS.AST_Finally) {
            // We add enter handlers this for catch and finally blocks because
            // we exit the current function when we see a throw or catch an
            // exception on a function call in order to exit from functions
            // properly.
            descend(node, this)

            node.body.unshift(parse("window.profiler.catch()"))
            node.start = node.body[0]

            return node
        }
    }

    var transformer = new UglifyJS.TreeTransformer(beforeVisitor)

    function paths(node) {
        var ps = []
        for(var c in node.children) {
            var child_paths = paths(node.children[c])
            for(var p in child_paths) {
                child_paths[p].unshift(node.name)
                ps.push(child_paths[p])
            }
        }
        if(node.children.length == 0)
            ps = [[node.name]]
        return ps
    }

    function nodes(node) {
        var ns = [node.name]
        for(var c in node.children) {
            var child_nodes = nodes(node.children[c])
            $.merge(ns, child_nodes)
        }
        return ns
    }

    function node_times(node) {
        var times = {}
        times[node.name] = [node.stopTime - node.startTime]
        for(var c in node.children) {
            var child_times = node_times(node.children[c])
            for(var n in child_times)
                times[n] = $.merge(child_times[n], times[n] || [])
        }
        return times
    }

    return {
        enter: function(name, ref) {
            var call = {
                name: name,
                children: [],
                prev: currentCall,
                startTime: Date.now()
            }
            currentCall.children.push(call)
            currentCall = call
            if(!counts[name])
                counts[name] = 0
            counts[name]++
        },
        catch: function() {
            currentCall = currentCall.children[currentCall.children.length - 1]
        },
        exit: function() {
            currentCall.stopTime = Date.now()
            callgraph.stopTime = currentCall.stopTime
            currentCall = currentCall.prev
        },
        instrument: function(code) {
            var ast = UglifyJS.parse(code)
            ast.transform(transformer)
            return ast.print_to_string({ beautify: true })
        },
        callgraph: function() {
            return callgraph
        },
        paths: function() {
            return paths(callgraph)
        },
        node_stats: function() {
            var times = node_times(callgraph)
            var acc = []
            for(var node in times) {
                var t = times[node].sort()
                var avg = t.reduce(function(x,y) {return x+y}, 0)/t.length
                var p90 = t[Math.ceil(90/100 * t.length)-1]
                var p99 = t[Math.ceil(99/100 * t.length)-1]
                acc.push({name: node,
                          count: t.length,
                          avg: avg,
                          p90: p90,
                          p99: p99})
            }
            return acc
        }
    }
}

window.profiler = Profiler()
