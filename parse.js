const assert = require('assert')

const sortof = require('empathy')

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
        const type = sortof(value)
        switch (type) {
        case 'number':
            if (Number.isInteger(value) && value >= 0) {
                return 'range'
            }
            return type
        case 'string':
        case 'bigint':
        case 'symbol':
        case 'object':
        case 'array':
            return type
        }
    }

    const descend = [ 'BigInt', 'Symbol', 'Error', 'array', 'Number', 'Boolean', 'String' ]

    class Parser {
        static newable = true

        constructor (mode, type, accepted) {
            this.ranges = []
            this.mode = mode
            this.type = typeof type == 'string' || ! display ? type : type.prototype.constructor.name
            this.patterns = []
            this.errors = []
            this.accepted = accepted
        }

        consume (type, value) {
            switch (type) {
            case 'range': {
                    assert(this.patterns.length == 0)
                    assert(this.ranges.length < 2)
                    this.ranges.push(value)
                }
                break
            case 'number': {
                    this.patterns.push(value)
                }
                break
            case 'string':
            case 'regex': {
                    this.patterns.push(display ? value.toString() : value)
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
        array: class {
            static newable = true

            constructor (value) {
                this.forks = []
                for (const branch of value) {
                    assert(Array.isArray(branch))
                    this.forks.push(assume(branch.slice()))
                }
            }

            consume () {
                assert(false)
            }

            done () {
                return this.forks
            }
        },
        error: class extends Parser {
            constructor (value) {
                super('error', value, [ 'range', 'string', 'regex', 'object' ])
            }

            consume (type, value) {
                switch (type) {
                case 'string':
                case 'regex':
                    super.consume('object', { message: display ? value.toString() : value })
                    break
                default:
                    super.consume(type, value)
                    break
                }
            }
        },
        string: class extends Parser {
            constructor () {
                super('string', 'string', [ 'range', 'string' ])
            }
        },
        symbol: class extends Parser {
            constructor () {
                super('symbol', 'symbol', [ 'range', 'symbol' ])
            }
        },
        bigint: class extends Parser {
            constructor () {
                super('bigint', 'bigint', [ 'range', 'bigint' ])
            }
        },
        boolean: class extends Parser {
            constructor () {
                super('boolean', 'boolean', [ 'range', 'boolean', 'regex' ])
            }
        },
        number: class extends Parser {
            constructor () {
                super('number', 'number', [ 'range', 'number', 'regex' ])
                this.backlog = []
            }

            consume (type, value) {
                this.backlog.push({ type, value })
            }

            done (next = null) {
                switch (this.backlog.length) {
                case 0:
                case 1: {
                        for (const { type, value } of this.backlog) {
                            super.consume(type == 'range' ? 'number' : type, value)
                        }
                    }
                    break
                default: {
                        let count = 2
                        while (--count && this.backlog.length && this.backlog[0].type == 'range') {
                            super.consume('range', this.backlog.shift().value)
                        }
                        for (const { type, value } of this.backlog) {
                            super.consume(type == 'range' ? 'number' : type, value)
                        }
                    }
                    break
                }
                return super.done(next)
            }
        }
    }

    function parse (pattern, parser) {
        while (pattern.length != 0) {
            const shifted = pattern.shift()
            const value = shifted === Infinity ? Number.MAX_SAFE_INTEGER : shifted
            const type = qualify(value)
            if (~descend.indexOf(type)) {
                const builder = parsers[type.toLowerCase()]
                return parser.done(parse(pattern, new builder(value)))
            } else {
                Rescue.Error.assert(~parser.accepted.indexOf(type), 'PATTERN_TYPE_ERROR', { _mode: parser.mode, _type: type })
                parser.consume(type, value)
            }
        }
        return parser.done()
    }

    // If we do not have a type specified as the first argument, we assume
    // `Error` is the desired type.
    function assume (pattern) {
        const options = { match: -1, partial: false }
        if (Array.isArray(pattern[0])) {
            if (!pattern[0].every(element => Array.isArray(element))) {
                const vargs = pattern.shift()
                assert(vargs.length == 1 && typeof vargs[0] == 'number')
                if (vargs < 0) {
                    options.match = ~vargs[0]
                    options.partial = true
                } else {
                    options.match = vargs[0]
                }
            }
        }
        const type = qualify(pattern[0])
        if (~descend.indexOf(type)) {
            return {
                ...options,
                dive: [ 0, 0 ],
                test: { type: 'root' },
                next: parse(pattern, new parsers[type.toLowerCase()](pattern.shift()))
            }
        }
        return {
            ...options,
            dive: [ 0, 0 ],
            test: { type: 'root' },
            next: parse(pattern, new parsers.error(Error))
        }
    }

    assert(pattern != null && typeof pattern == 'object')

    return assume(pattern.slice())
}
