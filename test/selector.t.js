require('proof')(4, prove)

function prove (okay) {
    var Selector = require('../selector')
    var foo = require('./foo')
    var selector = new Selector(foo)
    okay(selector.prune([function (e) { return -1 }]), null, 'missing')
    okay(selector.prune([
        function (e) { return e.message == 'foo' ? 1 : -1 }
    ]).message, 'foo', 'root')
    var selector = new Selector(foo)
    okay(selector.prune([
        function (e) { return e.message == 'bar' ? 1 : 0 }
    ]).message, 'bar', 'depth')
    var selector = new Selector(foo)
    okay(selector.prune([
        function (e) { return e.message == 'bar' ? 1 : 0 },
        function (e) { return e.message == 'qux' ? 1 : -1 }
    ]).message, 'qux', 'path')
}
