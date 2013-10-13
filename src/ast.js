function Lambda(body, args) {
    var lambda = new UglifyJS.AST_Lambda()
    lambda.body = body
    lambda.argnames = args
    lambda.body.start = lambda.body[0]
    lambda.body.end = lambda.body[lambda.body.length-1]
    return lambda
}

function Symbol(name) {
    var n = new UglifyJS.AST_SymbolRef()
    n.name = name
    return n
}

function Assign(name, value) {
    var assign = new UglifyJS.AST_Var()
    assign.definitions = [new UglifyJS.AST_VarDef()]
    assign.definitions[0].name = name
    assign.definitions[0].value = value
    return assign
}

function Apply(f, args) {
    var apply = new UglifyJS.AST_Call();
    apply.expression = f
    apply.args = args
    return apply
}

function Return(val) {
    var ret = new UglifyJS.AST_Return()
    ret.value = val
    return ret
}

function Try(t, c) {
    var block = new UglifyJS.AST_Try()
    block.body = [t]
    block.bcatch = Catch(c)
    console.log(block)
    return block
}

function Catch(c) {
    var bcatch = new UglifyJS.AST_Catch()
    bcatch.body = [c]
    bcatch.argname = new UglifyJS.AST_SymbolCatch();
    bcatch.argname.name = "e"
    return bcatch
}
