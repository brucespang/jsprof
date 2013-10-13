var Profiler = (function() {
    var date = new Date()
    
    var callgraph = {
        name: "root",
        startTime: date.getTime(),
        children: []
    }
    var currentCall = callgraph
    var id = 0

    function beforeVisitor(node, descend) {
        if(node instanceof UglifyJS.AST_Try)
            console.log(node)
        
        if(node instanceof UglifyJS.AST_Lambda || node instanceof UglifyJS.AST_Catch || node instanceof UglifyJS.AST_Finally) {
            // If we see a function, a catch block, or a finally block, we need to begin a
            // function. We do this for catch and finally blocks because we exit the current
            // function when we see a throw or catch an exception on a function call in order
            // to exit from functions properly.

            descend(node, this)

            var name = node.name ? node.name.name : null
            if(name == null && node instanceof UglifyJS.AST_Lambda)
                name = "[Anonymous]"
            
            node.body.unshift(UglifyJS.parse("window.Profiler.enter('"+name+"', this)").body[0])
            node.body.push(UglifyJS.parse("window.Profiler.exit()").body[0])
            
            node.start = node.body[0]
            node.end = node.body[node.body.length-1]
            
            return node
        } else if(node instanceof UglifyJS.AST_Exit) {
            // we want to ensure that the last effective statement in every function
            // is Profiler.exit(). This code generates a block that replaces an exit value
            // in a way that guarantees that exit() is the last call in the function. e.g.:
            //   return "a" -> return (function(){var res_1 = "a"; window.Profiler.exit(); res_1})()
            //   return long_function() -> return (function(){
            //                                       var res_2 = long_function();
            //                                       window.Profiler.exit();
            //                                       return res_1})()
            
            var name = Symbol("res_" + id)
            id += 1

            var assign = Assign(name, node.value)
            var exit = UglifyJS.parse("window.Profiler.exit()").body[0]
            
            node.value = Apply(Lambda([assign, exit, Return(name)], []), [])
            
            return node
        } else if(node instanceof UglifyJS.AST_Call) {
            // we want to wrap all function calls in try/catch blocks so that if an exception
            // is thrown in the function, we can exit out of the current function in the
            // profiler before propagating the exception
            return Try(node, UglifyJS.parse("window.Profiler.exit()").body[0])
        }
    }

    var transformer = new UglifyJS.TreeTransformer(beforeVisitor)
    
    return {
        enter: function(ref) {
            var call = {
                name: ref,
                children: [],
                prev: currentCall,
                startTime: date.getTime()
            }
            currentCall.children.push(call)
            currentCall = call
        },
        exit: function() {
            currentCall.stopTime = date.getTime()
            currentCall = currentCall.prev
        },
        instrument: function(code) {
            var ast = UglifyJS.parse(code)
            console.log(ast)
            ast.transform(transformer)
            return ast.print_to_string({ beautify: true })
        },
        callgraph: function() {
            return callgraph
        }
    }
})()

window.Profiler = Profiler
