const qux = new Error('qux')
qux.errors = [ 1 ]
qux.code = 'ENOENT'
const bar = new Error('bar')
bar.errors = [ qux ]
const baz = new Error('baz')
baz.errors = [{ value: 1 }]
const foo = new Error('foo')
const quux = new Error('quux')
quux.errors = [ bar ]
foo.errors = [ bar, baz, quux ]

module.exports = foo
