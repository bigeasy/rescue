require('proof')(8, prove)

function prove (okay) {
    var rescue = require('..')
    var foo = require('./foo')
    rescue([{
        name: 'minimal',
        when: [ function (e) { return e.message == 'foo' } ]
    }], function (rescued) {
        okay({
            name: rescued.name,
            messages: rescued.errors.map(function (e) { return e.message })
        }, {
            name: 'minimal',
            messages: [ 'foo' ]
        }, 'minimal')
    })(foo)
    rescue([{
        name: 'missed',
        when: [ /^corge$/ ]
    }, {
        name: 'regex',
        when: [ /^foo$/ ]
    }])(function (rescued) {
        okay({
            name: rescued.name,
            messages: rescued.errors.map(function (e) { return e.message })
        }, {
            name: 'regex',
            messages: [ 'foo' ]
        }, 'missed and regex')
    })(foo)
    rescue([{
        name: 'depth',
        when: [ '..', /^code:ENOENT$/ ]
    }])(function (rescued) {
        okay({
            name: rescued.name,
            messages: rescued.errors.map(function (e) { return e.message })
        }, {
            name: 'depth',
            messages: [ 'qux' ]
        }, 'depth and alternate property regex')
    })(foo)
    rescue([{
        name: 'missed',
        when: [ '..', /^code:ENOENT$/, 'only' ]
    }, {
        name: 'depth',
        when: [[ '..', /^code:ENOENT$/ ], [ /^foo$/, /^baz$/ ], 'only' ]
    }])(function (rescued) {
        okay({
            name: rescued.name,
            messages: rescued.errors.map(function (e) { return e.message })
        }, {
            name: 'depth',
            messages: [ 'qux', 'baz' ]
        }, 'only and mulitple')
    })(foo)
    rescue([ '..', /^code:ENOENT$/ ], function (rescued) {
        okay({
            name: rescued.name,
            messages: rescued.errors.map(function (e) { return e.message })
        }, {
            name: null,
            messages: [ 'qux' ]
        }, 'shorthand')
    })(foo)
    rescue(/^foo$/, function (rescued) {
        okay({
            name: rescued.name,
            messages: rescued.errors.map(function (e) { return e.message })
        }, {
            name: null,
            messages: [ 'foo' ]
        }, 'shorterhand')
    })(foo)
    var rescuer = rescue([ '..', /^code:ENOENT$/ ], null)
    try {
        rescuer(new Error('raised'))
    } catch (e) {
        okay(e.message, 'raised', 'rethrown')
    }
    rescuer(foo) // swallowed
    okay(rescue(/^foo$/, 'x')(foo), 'x', 'return value')
}
