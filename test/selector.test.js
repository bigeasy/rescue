describe('selector', () => {
    const assert = require('assert')
    const Selector = require('../selector')
    const foo = require('./foo')
    it('can prune', () => {
        const selector = new Selector(foo)
        const found = selector.prune([() => null], [ 0, Infinity ])
        assert.deepStrictEqual(found, [], 'missing')
        assert(!selector.empty, 'still has errors')
    })
    it('can descend and match', () => {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 0, Infinity ])
        assert.deepStrictEqual(found.map(e => e.message), [ 'baz' ], 'found')
        assert(!selector.empty, 'still has errors')
    })
    it('can match root', () => {
        const selector = new Selector(foo)
        const found = selector.prune([
            (e) => e.message == 'foo' ? [ 0, 1 ] : null
        ], [ 0, 1 ])
        assert.deepStrictEqual(found.map(e => e.message), [ 'foo' ], 'found')
        assert(selector.empty, 'matched all errors')
    })
    it('can match at a depth', () => {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 0, 1 ])
        assert.deepStrictEqual(found.map(e => e.message), [ 'baz' ], 'found')
        assert(!selector.empty, 'still has errors')
    })
    it('can fail to match because depth range', () => {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 0, 0 ])
        assert.deepStrictEqual(found.map(e => e.message), [], 'missing')
        assert(!selector.empty, 'still has errors')
    })
    it('can skip to a particular depth', () => {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 1, 1 ])
        assert.deepStrictEqual(found.map(e => e.message), [ 'baz' ], 'found')
        assert(!selector.empty, 'still has errors')
    })
    it('can match nested', () => {
        const selector = new Selector(foo)
        const found = selector.prune([
            (e) => e.message == 'bar' ? [ 0, Infinity ] : null,
            (e) => e.message == 'qux' ? [ 0, 1 ] : null
        ], [ 0, 1 ])
        assert.deepStrictEqual(found.map(e => e.message), [ 'qux' ], 'found')
        assert(!selector.empty, 'still has errors')
    })
    it('can match nested after skip', () => {
        const selector = new Selector(foo)
        const found = selector.prune([
            (e) => e.message == 'foo' ? [ 2, 2 ] : null,
            (e) => e.message == 'qux' ? [ 0, 1 ] : null
        ], [ 0, 1 ])
        assert.deepStrictEqual(found.map(e => e.message), [ 'qux' ], 'found')
        assert(!selector.empty, 'still has errors')
    })
})
