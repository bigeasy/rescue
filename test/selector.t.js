require('proof')(16, (okay) => {
    const Selector = require('../selector')
    const foo = require('./foo')
    {
        const selector = new Selector(foo)
        const found = selector.prune([() => null], [ 0, Infinity ])
        okay(found, [], 'prune missing')
        okay(!selector.empty, 'prune still has errors')
    }
    {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 0, Infinity ])
        okay(found.map(e => e.message), [ 'baz' ], 'descend and match found')
        okay(!selector.empty, 'descend and match still has errors')
    }
    {
        const selector = new Selector(foo)
        const found = selector.prune([
            (e) => e.message == 'foo' ? [ 0, 1 ] : null
        ], [ 0, 1 ])
        okay(found.map(e => e.message), [ 'foo' ], 'match route found')
        okay(selector.empty, 'match route matched all errors')
    }
    {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 0, 1 ])
        okay(found.map(e => e.message), [ 'baz' ], 'match at a depth found')
        okay(!selector.empty, 'match at a depth still has errors')
    }
    {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 0, 0 ])
        okay(found.map(e => e.message), [], 'fail to match because depth range missing')
        okay(!selector.empty, 'fail to match because depth range still has errors')
    }
    {
        const selector = new Selector(foo)
        const found = selector.prune([(e) => e.message == 'baz' ? [ 0, 1 ] : null ], [ 1, 1 ])
        okay(found.map(e => e.message), [ 'baz' ], 'skip to a particular depth found')
        okay(!selector.empty, 'skip to a particular depth still has errors')
    }
    {
        const selector = new Selector(foo)
        const found = selector.prune([
            (e) => e.message == 'bar' ? [ 0, Infinity ] : null,
            (e) => e.message == 'qux' ? [ 0, 1 ] : null
        ], [ 0, 1 ])
        okay(found.map(e => e.message), [ 'qux' ], 'match nested found')
        okay(!selector.empty, 'match nested still has errors')
    }
    {
        const selector = new Selector(foo)
        const found = selector.prune([
            (e) => e.message == 'foo' ? [ 2, 2 ] : null,
            (e) => e.message == 'qux' ? [ 0, 1 ] : null
        ], [ 0, 1 ])
        okay(found.map(e => e.message), [ 'qux' ], 'match nested after skip found')
        okay(!selector.empty, 'match nested after skip still has errors')
    }
})
