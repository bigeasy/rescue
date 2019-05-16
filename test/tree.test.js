describe('tree', () => {
    const assert = require('assert')
    const foo = require('./foo')
    const tree = require('../tree')
    it('can convert a tree', () => {
        assert.deepStrictEqual(tree(foo).causes[0], {
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
    })
})
