const rescue = require('..')

const Benchmark = require('benchmark').Benchmark

const suite = new Benchmark.Suite('frame')

function statement (json) {
    try {
        return JSON.parse(json)
    } catch (error) {
        if (!(error instanceof SyntaxError)) {
            throw error
        }
        return null
    }
}

function rescued (json) {
    try {
        return JSON.parse(json)
    } catch (error) {
        rescue(error, [ SyntaxError ])
        return null
    }
}

for (var i = 0; i < 4; i++)  {
    suite.add({
        name: ' Verbatim ' + i,
        fn: function () { statement('!') }
    })
    suite.add({
        name: '_Verbatim ' + i,
        fn: function () { rescued('!') }
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
