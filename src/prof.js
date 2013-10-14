function count_uniq(xs) {
    var counts = {}
    for(var x in xs) {
        if(!counts[xs[x]])
            counts[xs[x]] = 0
        counts[xs[x]] += 1
    }
    return counts
}

var Profiler = function() {
    var callgraph = {
        name: "root",
        startTime: Date.now(),
        children: []
    }
    var currentCall = callgraph
    var counts = {}
    
    var id = 0

    function beforeVisitor(node, descend) {
        if(node instanceof UglifyJS.AST_Lambda || node instanceof UglifyJS.AST_Catch || node instanceof UglifyJS.AST_Finally) {
            // If we see a function, a catch block, or a finally block, we need to begin a
            // function. We do this for catch and finally blocks because we exit the current
            // function when we see a throw or catch an exception on a function call in order
            // to exit from functions properly.

            descend(node, this)

            if(node.name)
                var name = node.name.name
            else if(node instanceof UglifyJS.AST_Lambda)
                var name = "[Anonymous]"
            else
                var name = "window.root"
            
            node.body.unshift(UglifyJS.parse("window.profiler.enter('"+name+"', this)").body[0])
            node.body.push(UglifyJS.parse("window.profiler.exit()").body[0])
            
            node.start = node.body[0]
            node.end = node.body[node.body.length-1]
            
            return node
        } else if(node instanceof UglifyJS.AST_Exit) {
            // we want to ensure that the last effective statement in every function
            // is Profiler.exit(). This code generates a block that replaces an exit value
            // in a way that guarantees that exit() is the last call in the function. e.g.:
            //   return "a" -> return (function(){var res_1 = "a"; window.profiler.exit(); res_1})()
            //   return long_function() -> return (function(){
            //                                       var res_2 = long_function();
            //                                       window.profiler.exit();
            //                                       return res_1})()
            
            var name = Symbol("res_" + id)
            id += 1

            var assign = Assign(name, node.value)
            var exit = UglifyJS.parse("window.profiler.exit()").body[0]
            
            node.value = Apply(Seq(Lambda([assign, exit, Return(name)], []), null), [])
            
            return node
        } else if(node instanceof UglifyJS.AST_Call) {
            // we want to wrap all function calls in try/catch blocks so that if an exception
            // is thrown in the function, we can exit out of the current function in the
            // profiler before propagating the exception
            // we need to wrap it in apply/lambda/return in case the programmer wants to do something insane like
            // store the result of a function call.
            descend(node, this)
            
            return Apply(Seq(Lambda([Try([Return(node)], [UglifyJS.parse("window.profiler.exit()").body[0], UglifyJS.parse("throw e").body[0]])], []), null), [])
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
            if(name != "window.root") {
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
            }
        },
        exit: function() {
            currentCall.stopTime = Date.now()
            callgraph.stopTime = currentCall.stopTime
            // we can't exit from the root node
            if(currentCall.prev)
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
        counts: function() {
            return counts
        },
        times: function() {
            return node_times(callgraph)
        }
    }
}

window.profiler = Profiler()
