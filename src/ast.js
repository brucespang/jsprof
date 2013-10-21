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

function Seq(car, cdr) {
    var seq = new UglifyJS.AST_Seq()
    seq.car = car
    seq.cdr = cdr
    return seq
}

function Try(t, c) {
    var block = new UglifyJS.AST_Try()
    block.body = t
    block.bcatch = Catch(c)
    return block
}

function Catch(c) {
    var bcatch = new UglifyJS.AST_Catch()
    bcatch.body = c
    bcatch.argname = new UglifyJS.AST_SymbolCatch();
    bcatch.argname.name = "e"
    return bcatch
}

function Dot(expr, prop) {
    var dot = new UglifyJS.AST_Dot()
    dot.expression = expr
    dot.property = prop
    return dot
}

function Block(body) {
    var block = new UglifyJS.AST_BlockStatement()
    block.body = body
    return block
}
