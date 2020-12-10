const rescue = require('.')

const f = rescue(null, [ SyntaxError ])

console.log('here')

f(new SyntaxError)
