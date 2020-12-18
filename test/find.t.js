require('proof')(1, (okay) => {
    const Tree = require('../tree')
    const Parse = require('../parse')
    const Compile = require('../compile')
    const Find = require('../find')

    const tree = Tree(new Error('hello'))
    const ast = Parse([ 'hello' ])
    const pcode = Compile(ast)
    okay(Find(pcode.match, pcode.dive, pcode.test, tree), [ 2 ], 'found')
})
