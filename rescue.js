const assert = require('assert')
const Selector = require('./selector')

const primitives = {
    types: [ Boolean, Number, String, BigInt, Array ],
    conditions: [
        (when) => {
            const conditions = [ (b) => typeof b == 'boolean' ]
            if (typeof when[0] == 'boolean') {
                const value = when.shift()
                conditions.push((b) => !! b == value)
            }
            conditions.push.apply(conditions, _functions(when))
            assert(when.length == 0)
            return conditions
        },
        (when) => {
            const conditions = [ (n) => typeof n == 'number' ]
            if (typeof when[0] == 'number') {
                const value = when.shift()
                conditions.push((n) => n == value)
            } else if (
                Array.isArray(when[0]) &&
                when[0].map((n) => typeof n == 'number').length == 2
            ) {
                const range = when.shift()
                conditions.push((n) => range[0] <= n && n <= range[1])
            }
            conditions.push.apply(conditions, _functions(when))
            assert(when.length == 0)
            return conditions
        },
        (when) => {
            const conditions = [ (s) => typeof s == 'string' ]
            if (typeof when[0] == 'string') {
                const value = when.shift()
                conditions.push((s) => s.toString() == value)
            } else if (when[0] instanceof RegExp) {
                const regex = when.shift()
                conditions.push((s) => regex.test(s.toString()))
                assert(when.length == 0)
            }
            conditions.push.apply(conditions, _functions(when))
            assert(when.length == 0)
            return conditions
        },
        (when) => {
            const conditions =  [ (n) => typeof n == 'bigint' ]
            if (typeof when[0] == 'bigint') {
                const value = when.shift()
                conditions.push((n) => n == value)
            } else if (
                Array.isArray(when[0]) &&
                when[0].map((n) => typeof n == 'bigint').length == 2
            ) {
                const range = when.shift()
                conditions.push((n) => range[0] <= n && n <= range[1])
            }
            conditions.push.apply(conditions, _functions(when))
            assert(when.length == 0)
            return conditions
        },
        (when) => {
            const conditions =  [ (a) => Array.isArray(a) ]
            if (Array.isArray(when[0])) {
                const value = when.shift()
                conditions.push((a) =>  a.filter((v, i) => value[i] == v).length == value.length)
            }
            conditions.push.apply(conditions, _functions(when))
            assert(when.length == 0)
            return conditions
        }
    ]
}

function _only (when) {
    if (typeof when[0] == 'boolean') {
        return when.shift()
    }
    return true
}

function _dive (when) {
    if (typeof when[0] == 'number') {
        const dive = when.shift()
        return [ dive, dive ]
    }
    if (
        Array.isArray(when[0]) &&
        when[0].filter((n) => typeof n == 'number').length == 2
    ) {
        return when.shift()
    }
    return [ 0, Infinity ]
}

function _type (when) {
    if (
        typeof when[0] == 'function' &&
        when[0].prototype != null &&
        typeof when[0].prototype == 'object'
    ) {
        return when.shift()
    }
    return Error
}

function _string (when, type) {
    if (typeof when[0] == 'string') {
        const string = when.shift()
        if (type.prototype instanceof Error || type === Error) {
            return [ (e) => e.message == string ]
        }
        return [ (o) => o.toString() == string ]
    } else if (when[0] instanceof RegExp) {
        const regex = when.shift()
        if (type.prototype instanceof Error || type === Error) {
            return [ (e) => regex.test(e.message) ]
        }
        return [ (o) => regex.test(o.toString()) ]
    }
    return []
}

function _properties (when) {
    if (typeof when[0] == 'object' && !Array.isArray(when[0])) {
        const properties = when.shift()
        return [ (o) => {
            for (const property in properties) {
                if (properties[property] instanceof RegExp) {
                    if (!properties[property].test(o[property])) {
                        return false
                    }
                } else {
                    if (properties[property] != o[property]) {
                        return false
                    }
                }
            }
            return true
        } ]
    }
    return []
}

function _functions (when) {
    const functions = []
    for (;;) {
        if (
            typeof when[0] == 'function' &&
            (
                when[0].prototype == null ||
                typeof when[0].prototype != 'object'
            )
        ) {
            functions.push(when.shift())
        } else {
            return functions
        }
    }
}

function _callback (vargs) {
    if (typeof vargs[0] == 'function') {
        return vargs.shift()
    }
    if (vargs.length != 0 && !Array.isArray(vargs[0])) {
        const result = vargs.shift()
        return () => result
    }
    return () => {}
}

module.exports = function (error, ...vargs) {
    const cases = []
    if (vargs.length == 1) {
        if (
            Array.isArray(vargs[0]) &&
            Array.isArray(vargs[0][0]) &&
            (
                vargs[0][0].length != 2
                ||
                vargs[0][0].filter((n) => typeof n == 'number').length != 2
            )
        ) {
            vargs = vargs[0]
        }
    }
    while (vargs.length) {
        const parts = [{ dive: [ 0, Infinity ] }]
        const when = vargs.shift()
        const only = _only(when)
        while (when.length) {
            const conditions = []
            parts[parts.length - 1].dive = _dive(when)
            const type = _type(when)
            const index = primitives.types.indexOf(type)
            if (~index) {
                conditions.push.apply(conditions, primitives.conditions[index](when))
            } else {
                conditions.push((e) => e instanceof type)
                conditions.push.apply(conditions, _string(when, type))
                conditions.push.apply(conditions, _properties(when))
                conditions.push.apply(conditions, _functions(when))
            }
            parts.push({ dive: [ 0, 1 ], conditions: conditions })
        }
        const callback = _callback(vargs)
        const path = []
        for (let i = 1, I = parts.length; i < I; i++) {
            const { dive, conditions } = parts[i]
            path.push((e) => {
                for (const condition of conditions) {
                    if (!condition(e)) {
                        return null
                    }
                }
                return dive
            })
        }
        const dive = parts[0].dive
        cases.push({
            test: (error) => {
                const selector = new Selector(error)
                const errors = []
                const found = selector.prune(path, dive)
                if (found.length != 0) {
                    if (only) {
                       return found.length == 1 ? found.shift() : null
                    }
                    return found
                }
                return null
            },
            callback: callback
        })
    }
    for (var i = 0, I = cases.length; i < I; i++) {
        const found = cases[i].test(error)
        if (found != null) {
            return cases[i].callback(found)
        }
    }
    throw error
}
