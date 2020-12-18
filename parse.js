const assert = require('assert')

const Rescue = { Error: require('./error') }


module.exports = function (pattern, { display = false } = {}) {
    // For all the basic types, primitive and native objects...
    //
    // * [JavaScript data types and data
    // structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures).

    //
    const BASICS = new Set([ Error, Number, String, Boolean, Symbol, BigInt ])
    //

    // News to me after all these years...
    //
    // * [what is the best way to check variable type in javascript - Michael
    // Mikowski](https://stackoverflow.com/a/17583612)
    // * [Check whether variable is number or string in JavaScript - Michael
    // Mikowski](https://stackoverflow.com/a/14206536)
    // * [Standard ECMA-262 5.1 Edition - `Object.prototype.toString()`]
    // https://www.ecma-international.org/ecma-262/5.1/#sec-15.2.4.2
    //
    // I never create strings or numbers with a constructor, so I've never
    // encoutered this as a problem.

    //
    function qualify (value) {
        assert(value != null)
        if (BASICS.has(value)) {
            return value.name
        }
        if (value.prototype instanceof Error) {
            return 'Error'
        }
        if (value instanceof RegExp) {
            return 'regex'
        }
        const type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        switch (type) {
        case 'number':
            if (Number.isInteger(value) && value >= 0) {
                return 'range'
            }
            return type
        case 'string':
        case 'symbol':
        case 'object':
        case 'array':
            return type
        }
    }

    const descend = [ 'Symbol', 'Error', 'array', 'Number', 'Boolean', 'String' ]
    const expected = {
        error: [ 'range', 'object', 'string', 'regex' ],
        symbol: [ 'range', 'symbol' ],
        array: [ 'array' ],
        number: [ 'number', 'range' ],
        bool: [ 'bool' ],
        string: [ 'string' ],
        bigint: [ 'bigint' ]
    }

    function range (range, object, value) {
        switch (range) {
        case 'max': {
                object.dive[1] = value
                return 'min'
            }
        case 'min': {
                object.dive[0] = object.dive[1]
                object.dive[1] = value
                return 'done'
            }
        case 'done': {
                throw new Error('unexpected range')
            }
        }
    }

    class Parser {
        static newable = true

        constructor (mode, type, accepted) {
            this.ranges = []
            this.mode = mode
            this.type = type
            this.patterns = []
            this.errors = []
            this.accepted = accepted
        }

        consume (type, value) {
            if (~this.accepted.indexOf(type)) {
                switch (type) {
                case 'range': {
                        this.ranges.push(value)
                    }
                    break
                case 'string':
                case 'regex': {
                        this.patterns.push({ message: display ? value.toString() : value })
                    }
                    break
                case 'symbol': {
                        this.patterns.push(display ? value.toString() : value)
                    }
                    break
                case 'object': {
                        this.patterns.push(value)
                    }
                    break
                }
            } else {
                this.errors.push(new Rescue.Error('UNEXPECTED_CONDITION_TYPE', 0, { mode: this.mode, type }))
            }
        }

        done (next = null) {
            if (this.ranges.length > 2) {
                this.errors.push(new Rescue.Error('TOO_MANY_RANGES', 0, { ranges }))
            }
            if (this.ranges.length == 2 && this.ranges[0] > this.ranges[1]) {
                this.errors.push(new Rescue.Error('RANGES_OUT_OF_ORDER', 0, { ranges }))
            }
            const dive = this.ranges.length == 2
                ? this.ranges
                : this.ranges.length == 1
                    ? [ 0, this.ranges[0] ]
                    : [ 0, Number.MAX_SAFE_INTEGER ]
            return {
                dive: dive,
                test: {
                    patterns: this.patterns,
                    type: this.type
                },
                next
            }
        }
    }

    const parsers = {
        array: function (object, value) {
            const forks = []
            for (const branch of value) {
                assert(Array.isArray(branch))
                forks.push(assume(branch.slice()))
            }
            return {
                done () {
                    return forks
                }
            }
        },
        error: function (object, value) {
            object.test = { ...object.test, patterns: [], error: display ? value.prototype.name : value }
            return {
                range: 'max',
                mode: 'error',
                consume (type, value) {
                    switch (type) {
                    case 'range': {
                            this.range = range(this.range, object, value)
                        }
                        break
                    case 'string':
                    case 'regex': {
                            object.test.patterns.push({ message: display ? value.toString() : value })
                        }
                        break
                    case 'object': {
                            object.test.patterns.push(value)
                        }
                        break
                    }
                },
                done (next = null) {
                    return { ...object, next }
                }
            }
        },
        string: function (object, value) {
            object.test = { ...object.test, patterns: [] }
            return {
                range: 'max',
                mode: 'string',
                consume (type, value) {
                    switch (type) {
                    case 'range': {
                            this.range = range(this.range, object, value)
                        }
                        break
                    case 'regex': {
                            object.test.patterns.push(display ? value.toString() : value)
                        }
                        break
                    case 'string': {
                            object.test.patterns.push(value)
                        }
                        break
                    }
                },
                done (next = null) {
                    return { ...object, next }
                }
            }
        },
        bigint: function (object, value) {
            object.test = { ...object.test, patterns: [] }
            return {
                range: 'max',
                mode: 'boolean',
                consume (type, value) {
                    switch (type) {
                        case 'range': {
                                this.range = range(this.range, object, value)
                            }
                            break
                        case 'bigint': {
                                object.test.patterns(value)
                            }
                            break
                    }
                },
                done (next = null) {
                    return { ...object, next }
                }
            }
        },
        symbol: class extends Parser {
            constructor () {
                super('symbol', 'symbol', [ 'range', 'symbol' ])
            }
        },
        boolean: function (object, value) {
            object.test = { ...object.test, patterns: [] }
            return {
                range: 'max',
                mode: 'boolean',
                consume (type, value) {
                    switch (type) {
                        case 'range': {
                                this.range = range(this.range, object, value)
                            }
                            break
                        case 'boolean': {
                                object.test.patterns(value)
                            }
                            break
                    }
                },
                done (next = null) {
                    return { ...object, next }
                }
            }
        },
        number: function (object, value) {
            object.test = { ...object.test, patterns: [] }
            let _value = null, wasRange = false
            const values = []
            return {
                range: 'max',
                mode: 'number',
                consume (type, value) {
                    switch (type) {
                        case 'number':
                        case 'range': {
                            values.push({ type, value })
                        }
                        break

                    }
                },
                done (next = null) {
                    assert(values.length <= 3)
                    if (values.length != 0) {
                        object.test.patterns.push(values.pop().value)
                    }
                    while (values.length > 2) {
                        object.test.patterns.push(values.pop().value)
                    }
                    assert(values.every(value => value.type == 'range'))
                    while (values.length != 0) {
                        object.range = range(this.range, object, values.shift().value)
                    }
                    return { ...object, next }
                }
            }
        }
    }

    function createObject (type) {
        return { dive: [ 0, Number.MAX_SAFE_INTEGER ], test: { type: type.toLowerCase() }, next: null }
    }

    function parse (pattern, parser) {
        while (pattern.length != 0) {
            const shifted = pattern.shift()
            const value = shifted === Infinity ? Number.MAX_SAFE_INTEGER : shifted
            const type = qualify(value)
            if (~descend.indexOf(type)) {
                const builder = parsers[type.toLowerCase()]
                if (builder.newable) {
                    return parser.done(parse(pattern, new builder(value)))
                } else {
                    return parser.done(parse(pattern, builder(createObject(type), value)))
                }
            } else {
                // **TODO** Outgoing check in consume.
                assert(~expected[parser.mode].indexOf(type))
                parser.consume(type, value)
            }
        }
        return parser.done()
    }

    // If we do not have a type specified as the first argument, we assume
    // `Error` is the desired type.
    function assume (pattern) {
        const options = { match: -1 }
        if (Array.isArray(pattern[0])) {
            if (!pattern[0].every(element => Array.isArray(element))) {
                const vargs = pattern.shift()
                assert(vargs.length == 1 && typeof vargs[0] == 'number')
                options.match = vargs[0]
            }
        }
        const type = qualify(pattern[0])
        if (~descend.indexOf(type)) {
            return {
                ...options,
                dive: [ 0, 0 ],
                test: { type: 'root' },
                next: parse(pattern, parsers[type.toLowerCase()](createObject(type), pattern.shift()))
            }
        }
        return {
            ...options,
            dive: [ 0, 0 ],
            test: { type: 'root' },
            next: parse(pattern, parsers.error(createObject('Error'), Error))
        }
    }

    assert(pattern != null && typeof pattern == 'object')

    return assume(pattern.slice())
}
