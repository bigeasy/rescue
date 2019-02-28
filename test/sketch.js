require('proof')(1, prove)

function prove (okay) {
    try {
        throw new Error(/^baz$/)
    } catch (e) {
        rescue([{
            name: 'bar',
            when: [ /^foo$/, '**', /^bar$/, 'only' ]
        }, {
        }, {
        }], function (e) {
        })
    }
}
