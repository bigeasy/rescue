require('proof')(3, prove)

function prove (assert) {
    var recover = require('..')

    var array = recover(function (property) {
        var error = new Error('thrown')
        error.property = property
        throw error
    }, /^property:.*catch me/, function (error) {
        assert(error.message, 'thrown', 'caught')
    })

    try {
        array[0]('catch me')
    } catch (error) {
        array[1](error)
    }
    try {
        try {
            array[0]('no catch')
        } catch (error) {
            array[1](error)
        }
    } catch (error) {
        assert(error.message, 'thrown', 'rethrown')
    }

    array = recover(function (property) {
        var error = new Error('thrown')
        error.property = property
        throw error
    }, /^thrown$/, function (error) {
        assert(error.message, 'thrown', 'message caught')
    })

    try {
        array[0]('error')
    } catch (error) {
        array[1](error)
    }
}
