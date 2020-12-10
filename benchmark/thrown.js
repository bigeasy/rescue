const rescue = require('..')

const Benchmark = require('benchmark').Benchmark

const suite = new Benchmark.Suite('frame')

function statement (error) {
    try {
        throw new SyntaxError
    } catch (error) {
        return error instanceof SyntaxError
    }
}

const error = new SyntaxError

const f = rescue(error, [ SyntaxError ])

function rescued (error) {
    try {
        throw new SyntaxError
    } catch (error) {
        f(error)
        return true
    }
}


for (var i = 0; i < 4; i++)  {
    suite.add({
        name: ' Verbatim ' + i,
        fn: function () { statement(error) }
    })
    suite.add({
        name: '_Verbatim ' + i,
        fn: function () { rescued(error) }
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
