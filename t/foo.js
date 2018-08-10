var Selector = require('../selector')
var bar = new Error('bar')
bar.causes = [{ cause: new Error('qux') }]
var baz = new Error('baz')
var foo = new Error('foo')
var quux = new Error('quux')
quux.cause = bar
foo.causes = [ bar, baz, quux ]

module.exports = foo
