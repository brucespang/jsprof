var Profiler = (function() {
		var date = new Date()
		
		function Call(ref, prev) {
				this.ref = ref
				this.startTime = date.getTime()
				this.prev = prev
				this.next = []
		}

		var currentCall = null
		var callgraph = null
		
		var modifiers = [
				esmorph.Tracer.FunctionEntrance(function(fn) {
						return "window.Profiler.enter("+ fn.name +")"
				}),
				esmorph.Tracer.FunctionExit(function(fn) {
						return "window.Profiler.exit("+ fn.name +")"
				})
		]
		
		return {
				start: function() {
						callgraph = new Call(null, null)
						currentCall = callgraph
				},
				stop: function() {
						callgraph.stopTime = date.getTime()
				},
				enter: function(ref) {
						var call = new Call(ref, currentCall)
						currentCall.next.push(call)
						currentCall = call
				},
				exit: function(ref) {
						currentCall.stopTime = date.getTime()
						currentCall = currentCall.prev
				},
				instrument: function(path) {
						console.log("loading: " + path)
						
						return $.get(path, function(){}, "html").then(function(res){
								var code = esmorph.modify(res, modifiers)
								return "Profiler.start();\n\n "+code+"; \n\nProfiler.stop();"
						}, function(err) {
								console.log("ERROR", err)
						})
				},
				callgraph: function() {
						return callgraph
				}
		}
})()

window.Profiler = Profiler
