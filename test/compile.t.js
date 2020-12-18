require('proof')(2, okay => {
    const compile = require('../compile')
    const parse = require('../parse')

    {
        const descent = compile(parse([ 'hello' ]))
        okay(descent.test().test(new Error('hello')), 'compiled and hit')
        okay(!descent.test().test(new Error('world')), 'compiled and miss')
    }
})
