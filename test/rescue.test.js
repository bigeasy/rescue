describe('rescue', () => {
    const assert = require('assert')
    const Root = { Error: class extends Error {} }
    const Sought = { Error: class extends Error {} }
    const Other = { Error: class extends Error {} }
    const rescue = require('..')
    it('can match by error type', () => {
        const test = []
        try {
            throw new Sought.Error('error')
        } catch (error) {
            rescue(error, [ Sought.Error ], error => test.push(error.message))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can return a value instead of call a funtion', () => {
        const test = []
        try {
            throw new Sought.Error('error')
        } catch (error) {
            test.push(rescue(error, [ Sought.Error ], true))
        }
        assert.deepStrictEqual(test, [ true ], 'rescued')
    })
    it('can swallow errors', () => {
        const test = []
        try {
            throw new Sought.Error('error')
        } catch (error) {
            test.push(rescue(error, [ Sought.Error ]))
        }
        assert.deepStrictEqual(test, [ undefined ], 'rescued')
    })
    it('can rethrow', () => {
        const test = []
        try {
            try {
                throw new Other.Error('other')
            } catch (error) {
                rescue(error, [ Sought.Error ])
            }
        } catch (error) {
            test.push(error.message)
        }
        assert.deepStrictEqual(test, [ 'other' ], 'rescued')
    })
    it('can match only', () => {
        const test = []
        try {
            try {
                const error = new Error('root')
                error.causes = [ new Error('error'), new Error('error') ]
                throw error
            } catch (error) {
                rescue(error, [ 'error' ])
            }
        } catch (error) {
            test.push(error.message)
        }
        assert.deepStrictEqual(test, [ 'root' ], 'rescued')
    })
    it('can match many', () => {
        const test = []
        try {
            const error = new Error('root')
            error.causes = [ new Error('error'), new Error('error') ]
            throw error
        } catch (error) {
            rescue(error, [ false, 'error' ], errors => {
                errors.map(error => test.push(error.message))
            })
        }
        assert.deepStrictEqual(test, [ 'error', 'error' ], 'rescued')
    })
    it('can at specific depth', () => {
        const test = []
        try {
            const error = new Error('error')
            error.causes = [ new Error('error') ]
            throw error
        } catch (error) {
            rescue(error, [ 1, 'error' ], error => test.push(!! error.causes))
        }
        assert.deepStrictEqual(test, [ false ], 'rescued')
    })
    it('can at match at a range of depth depth', () => {
        const test = []
        try {
            const error = new Error('error')
            error.causes = [ new Error('error') ]
            throw error
        } catch (error) {
            rescue(error, [ [ 1, 2 ], 'error' ], error => test.push(!! error.causes))
        }
        assert.deepStrictEqual(test, [ false ], 'rescued')
    })
    it('can match an error message', () => {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [ 'error' ], error => test.push(error.message))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can match an error message regex', () => {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [ /^error$/ ], error => test.push(error.message))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can match a property', () => {
        const test = []
        try {
            const error = new Error('error')
            error.code = 'ENOENT'
            throw error
        } catch (error) {
            rescue(error, [{ code: 'ENOENT' }], error => test.push(error.message))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can mismatch a property', () => {
        const test = []
        try {
            try {
                const error = new Error('error')
                error.code = 'ENOENT'
                throw error
            } catch (error) {
                rescue(error, [{ code: 'EACCES' }])
            }
        } catch (error) {
            test.push(error.message)
        }
        assert.deepStrictEqual(test, [ 'error' ], 'missed')
    })
    it('can match a property regex', () => {
        const test = []
        try {
            const error = new Error('error')
            error.code = 'ENOENT'
            throw error
        } catch (error) {
            rescue(error, [{ code: /^ENOENT$/ }], error => test.push(error.message))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can mismatch a property regex', () => {
        const test = []
        try {
            try {
                const error = new Error('error')
                error.code = 'ENOENT'
                throw error
            } catch (error) {
                rescue(error, [{ code: /^EACCES$/ }])
            }
        } catch (error) {
            test.push(error.message)
        }
        assert.deepStrictEqual(test, [ 'error' ], 'missed')
    })
    it('can match on a function', () => {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            const f = (e) => true
            f.prototype = 1
            rescue(error, [ f ], error => test.push(error.message))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can dive for errors', () => {
        const test = []
        try {
            try {
                throw new Sought.Error('sought')
            } catch (inner) {
                const outer = new Root.Error('root')
                outer.causes = [ inner ]
                throw outer
            }
        } catch (error) {
            rescue(error, [ Sought.Error ], (error) => test.push(error.message))
        }
        assert.deepStrictEqual(test, [ 'sought' ], 'rescued')
    })
    it('can accept matches in an array', () => {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [[ [ 0, 0 ], 'error' ], (error) => test.push(error.message) ])
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can accept multiple matches in an array', () => {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [
                [ 'other' ], (error) => { throw new Error },
                [ 'error' ], (error) => test.push(error.message)
            ])
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can match a toString value of an arbitrary object', () => {
        const test = []
        try {
            throw new RegExp('a')
        } catch (error) {
            debugger
            rescue(error, [ RegExp, '/a/' ], (object) => test.push(String(object)))
        }
        assert.deepStrictEqual(test, [ '/a/' ], 'rescued')
    })
    it('can regex match a toString value of an arbitrary object', () => {
        const test = []
        try {
            throw new RegExp('a')
        } catch (error) {
            debugger
            rescue(error, [ RegExp, /^\/a\/$/ ], (object) => test.push(String(object)))
        }
        assert.deepStrictEqual(test, [ '/a/' ], 'rescued')
    })
    it('can match an boolean exception', function () {
        const test = []
        try {
            throw true
        } catch (error) {
            rescue(error, [ Boolean ], (b) => test.push(b))
        }
        assert.deepStrictEqual(test, [ true ], 'rescued')
    })
    it('can match an boolean exception by value', function () {
        const test = []
        try {
            throw true
        } catch (error) {
            rescue(error, [ Boolean, true ], (b) => test.push(b))
        }
        assert.deepStrictEqual(test, [ true ], 'rescued')
    })
    it('can mismatch an boolean exception by value', function () {
        const test = []
        try {
            try {
                throw false
            } catch (error) {
                rescue(error, [ Boolean, true ])
            }
        } catch (error) {
            test.push(error)
        }
        assert.deepStrictEqual(test, [ false ], 'missed')
    })
    it('can match a number exception', function () {
        const test = []
        try {
            throw 1
        } catch (error) {
            rescue(error, [ Number ], (n) => test.push(n))
        }
        assert.deepStrictEqual(test, [ 1 ], 'rescued')
    })
    it('can match a number exception by value', function () {
        const test = []
        try {
            throw 1
        } catch (error) {
            rescue(error, [ Number, 1 ], (n) => test.push(n))
        }
        assert.deepStrictEqual(test, [ 1 ], 'rescued')
    })
    it('can match a number exception by range', function () {
        const test = []
        try {
            throw 1
        } catch (error) {
            rescue(error, [ Number, [ 0, 1 ] ], (n) => test.push(n))
        }
        assert.deepStrictEqual(test, [ 1 ], 'rescued')
    })
    it('can match a string exception', function () {
        const test = []
        try {
            throw 'error'
        } catch (error) {
            rescue(error, [ String ], (s) => test.push(s))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can match a string exception by value', function () {
        const test = []
        try {
            throw 'error'
        } catch (error) {
            rescue(error, [ String, 'error' ], (s) => test.push(s))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can match a string exception by regex', function () {
        const test = []
        try {
            throw 'error'
        } catch (error) {
            rescue(error, [ String, /^error$/ ], (n) => test.push(n))
        }
        assert.deepStrictEqual(test, [ 'error' ], 'rescued')
    })
    it('can match a bigint exception', function () {
        const test = []
        try {
            throw 1n
        } catch (error) {
            rescue(error, [ BigInt ], (n) => test.push(n))
        }
        assert.deepStrictEqual(test, [ 1n ], 'rescued')
    })
    it('can match a bigint exception by value', function () {
        const test = []
        try {
            throw 1n
        } catch (error) {
            rescue(error, [ BigInt, 1n ], (n) => test.push(n))
        }
        assert.deepStrictEqual(test, [ 1n ], 'rescued')
    })
    it('can match a bigint exception by range', function () {
        const test = []
        try {
            throw 1n
        } catch (error) {
            rescue(error, [ BigInt, [ 0n, 1n ] ], (n) => test.push(n))
        }
        assert.deepStrictEqual(test, [ 1n ], 'rescued')
    })
    it('can match an array exception', function () {
        const test = []
        try {
            throw [ 1, 'a' ]
        } catch (error) {
            rescue(error, [ Array ], (a) => test.push(a))
        }
        assert.deepStrictEqual(test, [ [ 1, 'a' ] ], 'rescued')
    })
    it('can match an array exception by shallow compare', function () {
        const test = []
        try {
            throw [ 1, 'a' ]
        } catch (error) {
            rescue(error, [ Array, [ 1, 'a' ] ], (a) => test.push(a))
        }
        assert.deepStrictEqual(test, [ [ 1, 'a' ] ], 'rescued')
    })
    it('can mismatch an array exception by shallow compare', function () {
        const test = []
        try {
            try {
                throw [ 1, 'a' ]
            } catch (error) {
                rescue(error, [ Array, [ 1, 'a', null ] ])
            }
        } catch (error) {
            test.push(error)
        }
        assert.deepStrictEqual(test, [ [ 1, 'a' ] ], 'missed')
    })
    it('can return async functions', async () => {
        const result = await rescue(new Error('error'), [ Error ], async (e) => e.message)
        assert.equal(result, 'error')
    })
    it('can return sync results async', async () => {
        const result = await rescue(new Error('error'), [ Error ], (e) => e.message)
        assert.equal(result, 'error')
    })
})
