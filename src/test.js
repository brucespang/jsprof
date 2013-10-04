function bar() {
    console.log("bar")
}
      
function foo() {
		for(var i = 0; i < 2; i++)
				bar()
}

foo()
