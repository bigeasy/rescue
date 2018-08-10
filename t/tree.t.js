require('proof')(1, prove)

function prove (okay) {
    var foo = require('./foo')
    var tree = require('../tree')
    okay(tree(foo).tree, {
        index: 0,
        message: 'foo',
        causes: [{
            index: 1,
            message: 'bar',
            causes: [{
                index: 2,
                message: 'qux',
                causes: []
            }]
        }, {
            index: 3,
            message: 'baz',
            causes: []
        }, {
            index: 4,
            message: 'quux',
            causes: [{
                index: 1,
                message: 'bar',
                causes: [{
                    index: 2,
                    message: 'qux',
                    causes: []
                }]
            }]
        }]
    }, 'tree')
}
