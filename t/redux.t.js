require('proof')(1, prove)

function prove (okay) {
    var rescue = require('../redux')
    var foo = require('./foo')
    rescue([{
        name: 'minimal',
        when: [ function (e) { return e.message == 'foo' } ]
    }])(function (rescued) {
        okay({
            name: rescued.name,
            messages: rescued.errors.map(function (e) { return e.message })
        }, {
            name: 'minimal',
            messages: [ 'foo' ]
        }, 'minimal')
    })(foo)
}
