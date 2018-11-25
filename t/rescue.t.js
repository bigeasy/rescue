require('proof')(7, prove)

function prove (okay) {
    var rescue = require('..')

    rescue(/^foo$/, function (error) {
        okay(error.message, 'foo', 'caught message')
    })(new Error('foo'))

    var f = rescue(/^code:EACCES$/, /^code:ENOENT$/, function (error) {
        okay(error.code, 'ENOENT', 'caught property')
    })
    var error = new Error
    error.code = 'ENOENT'
    f(error)

    try {
        rescue(/^foo$/, function (error) {
        })(new Error('bar'))
    } catch (e) {
        okay(e.message, 'bar', 'uncaught')
    }

    rescue([/^foo$/, function (error) {
        okay(error.message, 'foo', 'flatten array')
    }])(new Error('foo'))

    rescue(/^foo$/)(new Error('foo'))

    okay(rescue(/^foo$/, 1)(new Error('foo')), 1, 'return value')

    var cause = new Error('cause')
    cause.code = 'ENOENT'
    error = new Error('error')
    error.cause = cause

    okay(rescue(/^cause:cause$/, 1)(error), 1, 'nested exception')
    okay(rescue(/^cause.code:ENOENT$/, 1)(error), 1, 'nested exception property')
}
