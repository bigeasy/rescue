var assert = require('assert')
var Selector = require('./selector')

function test (when, retreat) {
    var f = when
    if (when instanceof RegExp) {
        var $ = /^\/\^([$\w][$\w\d.]*):/.exec(when.toString()), prefix, property
        if ($) {
            prefix = $[1] + ':'
            property = $[1]
        } else {
            prefix = ''
            property = 'message'
        }
        f = function (e) {
            var value = e[property]
            return value != null && when.test(prefix + String(value))
        }
    }
    assert(typeof f == 'function', 'condition must be regex or function')
    return function (e) { return f(e) ? 1 : retreat }
}

function path (definition) {
    assert(Array.isArray(definition), 'when must be an array')
    var i = 0, path = []
    while (i < definition.length) {
        if (definition[i] == '..') {
            while (definition[i] == '..') {
                i++
            }
            path.push(test(definition[i], 0))
        } else {
            path.push(test(definition[i], -1))
        }
        i++
    }
    return path
}

module.exports = function (cases, callback) {
    var type = 'none', seen = []
    if (typeof cases == 'function' || (cases instanceof RegExp)) {
        cases = [ cases, 'only' ]
    }
    if (!(cases[0].name != null && cases[0].when != null))  {
        cases = [{ name: null, when: cases }]
    }
    cases = cases.map(function (match, index) {
        assert(index == 0 || match.name != null, 'name must not be null')
        assert(!~seen.indexOf(match.name), 'duplicate name')
        seen.push(match.name)
        var when = match.when.slice()
        var only = when[when.length - 1] == 'only'
        if (only) {
            when.pop()
        }
        if (!Array.isArray(when[0])) {
            when = [ when ]
        }
        when = when.map(path)
        return {
            name: match.name,
            when: function (e) {
                var selector = new Selector(e)
                var errors = []
                for (var i = 0, I = when.length; i < I; i++) {
                    var error = selector.prune(when[i])
                    if (error == null) {
                        return null
                    }
                    errors.push(error)
                }
                if (only && !selector.isEmpty()) {
                    return null
                }
                return { name: match.name, errors: errors }
            }
        }
    })
    var rescuer = function (callback) {
        var f = callback
        if (callback == null) {
            f = function () {}
        } else if (typeof callback != 'function') {
            f = function () { return callback }
        }
        return function (e) {
            for (var i = 0, I = cases.length; i < I; i++) {
                var rescued = cases[i].when(e)
                if (rescued != null) {
                    return f.call(this, rescued)
                }
            }
            throw e
        }
    }
    return arguments.length == 2 ? rescuer(callback) : rescuer
}
