require('proof')(37, async (okay) => {
    const Root = { Error: class extends Error {} }
    const Sought = { Error: class extends Error {} }
    const Other = { Error: class extends Error {} }
    const rescue = require('..')
    {
        const test = []
        try {
            throw new Sought.Error('error')
        } catch (error) {
            rescue(error, [ Sought.Error ], error => test.push(error.message))
        }
        okay(test, [ 'error' ], 'error by type')
    }
    {
        const test = []
        try {
            throw new Sought.Error('error')
        } catch (error) {
            test.push(rescue(error, [ Sought.Error ], true))
        }
        okay(test, [ true ], 'return value instead of calling a function')
    }
    {
        const test = []
        try {
            throw new Sought.Error('error')
        } catch (error) {
            test.push(rescue(error, [ Sought.Error ]))
        }
        okay(test, [ undefined ], 'swallow errors')
    }
    {
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
        okay(test, [ 'other' ], 'rethrow')
    }
    {
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
        okay(test, [ 'root' ], 'match only')
    }
    {
        const test = []
        try {
            const error = new Error('root')
            error.causes = [ new Error('error'), new Error('error') ]
            throw error
        } catch (error) {
            rescue(error, [ 'error' ], [], errors => {
                errors.map(error => test.push(error.message))
            })
        }
        okay(test, [ 'error', 'error' ], 'match many')
    }
    {
        const test = []
        try {
            const error = new Error('error')
            error.causes = [ new Error('error') ]
            throw error
        } catch (error) {
            rescue(error, [ 1, 'error' ], error => test.push(!! error.causes))
        }
        okay(test, [ false ], 'specific depth')
    }
    {
        const test = []
        try {
            const error = new Error('error')
            error.causes = [ new Error('error') ]
            throw error
        } catch (error) {
            rescue(error, [ [ 1, 2 ], 'error' ], error => test.push(!! error.causes))
        }
        okay(test, [ false ], 'match range of depth')
    }
    {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [ 'error' ], error => test.push(error.message))
        }
        okay(test, [ 'error' ], 'match error message')
    }
    {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [ /^error$/ ], error => test.push(error.message))
        }
        okay(test, [ 'error' ], 'match error message by regex')
    }
    {
        const test = []
        try {
            const error = new Error('error')
            error.code = 'ENOENT'
            throw error
        } catch (error) {
            rescue(error, [{ code: 'ENOENT' }], error => test.push(error.message))
        }
        okay(test, [ 'error' ], 'match property')
    }
    {
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
        okay(test, [ 'error' ], 'mismatch property')
    }
    {
        const test = []
        try {
            const error = new Error('error')
            error.code = 'ENOENT'
            throw error
        } catch (error) {
            rescue(error, [{ code: /^ENOENT$/ }], error => test.push(error.message))
        }
        okay(test, [ 'error' ], 'match property by regex')
    }
    {
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
        okay(test, [ 'error' ], 'mismatch a property by regex')
    }
    {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            const f = (e) => true
            f.prototype = 1
            rescue(error, [ f ], error => test.push(error.message))
        }
        okay(test, [ 'error' ], 'match on function')
    }
    {
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
        okay(test, [ 'sought' ], 'dive for errors')
    }
    {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [[ [ 0, 0 ], 'error' ], (error) => test.push(error.message) ])
        }
        okay(test, [ 'error' ], 'accept matches in an array')
    }
    {
        const test = []
        try {
            throw new Error('error')
        } catch (error) {
            rescue(error, [
                [ 'other' ], (error) => { throw new Error },
                [ 'error' ], (error) => test.push(error.message)
            ])
        }
        okay(test, [ 'error' ], 'accept multiple matches in an array')
    }
    {
        const test = []
        try {
            throw new RegExp('a')
        } catch (error) {
            debugger
            rescue(error, [ RegExp, '/a/' ], (object) => test.push(String(object)))
        }
        okay(test, [ '/a/' ], 'match toString value of an arbitrary object')
    }
    {
        const test = []
        try {
            throw new RegExp('a')
        } catch (error) {
            debugger
            rescue(error, [ RegExp, /^\/a\/$/ ], (object) => test.push(String(object)))
        }
        okay(test, [ '/a/' ], 'regex match a toString value of an arbitrary object')
    }
    {
        const test = []
        try {
            throw true
        } catch (error) {
            rescue(error, [ Boolean ], (b) => test.push(b))
        }
        okay(test, [ true ], 'match boolean exception')
    }
    {
        const test = []
        try {
            throw true
        } catch (error) {
            rescue(error, [ Boolean, true ], (b) => test.push(b))
        }
        okay(test, [ true ], 'match boolean exception by value')
    }
    {
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
        okay(test, [ false ], 'mismatch boolean exception by value')
    }
    {
        const test = []
        try {
            throw 1
        } catch (error) {
            rescue(error, [ Number ], (n) => test.push(n))
        }
        okay(test, [ 1 ], 'match number exception')
    }
    {
        const test = []
        try {
            throw 1
        } catch (error) {
            rescue(error, [ Number, 1 ], (n) => test.push(n))
        }
        okay(test, [ 1 ], 'match a number exception by value')
    }
    {
        const test = []
        try {
            throw 1
        } catch (error) {
            rescue(error, [ Number, [ 0, 1 ] ], (n) => test.push(n))
        }
        okay(test, [ 1 ], 'match a number exception by range')
    }
    {
        const test = []
        try {
            throw 'error'
        } catch (error) {
            rescue(error, [ String ], (s) => test.push(s))
        }
        okay(test, [ 'error' ], 'match a string exception')
    }
    {
        const test = []
        try {
            throw 'error'
        } catch (error) {
            rescue(error, [ String, 'error' ], (s) => test.push(s))
        }
        okay(test, [ 'error' ], 'match string exception by value')
    }
    {
        const test = []
        try {
            throw 'error'
        } catch (error) {
            rescue(error, [ String, /^error$/ ], (n) => test.push(n))
        }
        okay(test, [ 'error' ], 'match string exception by regex')
    }
    {
        const test = []
        try {
            throw 1n
        } catch (error) {
            rescue(error, [ BigInt ], (n) => test.push(n))
        }
        okay(test, [ 1n ], 'match a bigint exception')
    }
    {
        const test = []
        try {
            throw 1n
        } catch (error) {
            rescue(error, [ BigInt, 1n ], (n) => test.push(n))
        }
        okay(test, [ 1n ], 'match a bigint exception by value')
    }
    {
        const test = []
        try {
            throw 1n
        } catch (error) {
            rescue(error, [ BigInt, [ 0n, 1n ] ], (n) => test.push(n))
        }
        okay(test, [ 1n ], 'match a bigint exception by range')
    }
    {
        const test = []
        try {
            throw [ 1, 'a' ]
        } catch (error) {
            rescue(error, [ Array ], (a) => test.push(a))
        }
        okay(test, [ [ 1, 'a' ] ], 'match an array exception')
    }
    {
        const test = []
        try {
            throw [ 1, 'a' ]
        } catch (error) {
            rescue(error, [ Array, [ 1, 'a' ] ], (a) => test.push(a))
        }
        okay(test, [ [ 1, 'a' ] ], 'match an array exception by shallow compare')
    }
    {
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
        okay(test, [ [ 1, 'a' ] ], 'mismatch an array exception by shallow compare')
    }
    {
        const result = await rescue(new Error('error'), [ Error ], async (e) => e.message)
        okay(result, 'await async function')
    }
    {
        const result = await rescue(new Error('error'), [ Error ], (e) => e.message)
        okay(result, 'away sync function as async')
    }
})
