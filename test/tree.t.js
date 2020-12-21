require('proof')(1, (okay) => {
    const foo = require('./foo')
    const tree = require('../tree')
    okay(tree(foo).node.errors[0], {
        id: 2,
        index: 0,
        message: 'foo',
        parent: 1,
        errors: [{
            id: 3,
            index: 1,
            message: 'bar',
            parent: 2,
            errors: [{
                id: 4,
                index: 2,
                parent: 3,
                message: 'qux',
                errors: [{
                    id: 5,
                    index: 3,
                    message: '1',
                    parent: 4,
                    errors: []
                }]
            }]
        }, {
            id: 6,
            index: 4,
            message: 'baz',
            parent: 2,
            errors: [{
                id: 7,
                index: 5,
                message: '[object Object]',
                parent: 6,
                errors: []
            }]
        }, {
            id: 8,
            index: 6,
            message: 'quux',
            parent: 2,
            errors: [{
                id: 9,
                index: 1,
                message: 'bar',
                parent: 8,
                errors: [{
                    id: 10,
                    index: 2,
                    parent: 9,
                    message: 'qux',
                    errors: [{
                        id: 11, index: 3, parent: 10, message: '1', errors: []
                    }]
                }]
            }]
        }]
    }, 'tree')

    // **TODO** Circular references. They shouldn't matter for the pattern
    // language since the pattern cannot create a circular reference and the
    // descent of the tree is driven by the tree not the pattern.

    // If a pattern goes through an interation of a ciruclar reference, the
    // prune ought to work fine. It would cause a problem where a fork occurs
    // well before a branch, going [[ a b a b a ], [ a b a b c ]] would prune a
    // from b and you wouldn't be able to reach c. We could defer the prune to
    // after the find, which I haven't done because I assumed that it would
    // cause problems if a second alternate matched into the first. Remove
    // something more specific, then something less specific.

    // Oddly, I have no way of dealing with ciruclar references in Interrupt
    // yet, would cause a stack explosion, so I should probably deal with it
    // there as well.
    debugger
    const error = new Error('error')
    const thrown = new Error('thrown')
    error.errors = [ thrown ]
    thrown.errors = [ error ]
    const t = tree(error)
    console.log(require('util').inspect(t.node, { depth: null }))

    {
        const raised = new Error('raised')
        const thrown = new Error('thrown')
        const flung = new Error('flung')
        raised.errors = [ thrown ]
        thrown.errors = [ raised, flung ]
        const t = tree(thrown)
        console.log(require('util').inspect(t.node, { depth: null }))
    }
})
