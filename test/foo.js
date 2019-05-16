const qux = new Error('qux')
qux.cause = 1
qux.code = 'ENOENT'
const bar = new Error('bar')
bar.causes = [ qux ]
const baz = new Error('baz')
baz.cause = { value: 1 }
const foo = new Error('foo')
const quux = new Error('quux')
quux.cause = bar
foo.causes = [ bar, baz, quux ]

module.exports = foo
