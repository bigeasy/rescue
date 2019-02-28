var Selector = require('../selector')
var qux = new Error('qux')
qux.cause = 1
qux.code = 'ENOENT'
var bar = new Error('bar')
bar.causes = [ qux ]
var baz = new Error('baz')
baz.cause = { value: 1 }
var foo = new Error('foo')
var quux = new Error('quux')
quux.cause = bar
foo.causes = [ bar, baz, quux ]

module.exports = foo
