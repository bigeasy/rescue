require('proof')(8, okay => {
    const parse = require('../parse')
    okay(parse([ Error ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, Number.MAX_SAFE_INTEGER ],
            test: { type: 'Error', patterns: [] },
            next: null
        }
    }, 'error')
    okay(parse([ Error, 'hello' ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, Number.MAX_SAFE_INTEGER ],
            test: {
                type: 'Error',
                patterns: [{ message: 'hello' }]
            },
            next: null
        }
    }, 'error with message by equality')
    okay(parse([ Error, /hello/ ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, Number.MAX_SAFE_INTEGER ],
            test: {
                type: 'Error',
                patterns: [{ message: '/hello/' }]
            },
            next: null
        }
    }, 'error with message by regex')
    okay(parse([ { code: 'ENOENT' } ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, Number.MAX_SAFE_INTEGER ],
            test: {
                type: 'Error',
                patterns: [{ code: 'ENOENT' }]
            },
            next: null
        }
    }, 'error property by quality')
    okay(parse([ 1, 'message' ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, 1 ],
            test: {
                type: 'Error',
                patterns: [{ message: 'message' }]
            },
            next: null
        }
    }, 'error by message with max depth')
    okay(parse([ 'message', Error, 'message', ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, Number.MAX_SAFE_INTEGER ],
            test: {
                type: 'Error',
                patterns: [{ message: 'message' }]
            },
            next: {
                dive: [ 0, Number.MAX_SAFE_INTEGER ],
                test: {
                    type: 'Error',
                    patterns: [{ message: 'message' }]
                },
                next: null
            }
        }
    }, 'error with error child')
    okay(parse([ 'message', [[ 'first' ], [ 'second' ]] ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, Number.MAX_SAFE_INTEGER ],
            test: {
                type: 'Error',
                patterns: [{ message: 'message' }]
            },
            next: [{
                match: -1,
                partial: false,
                dive: [ 0, 0 ],
                test: { type: 'root' },
                next: {
                    dive: [ 0, Number.MAX_SAFE_INTEGER ],
                    test: {
                        type: 'Error',
                        patterns: [{ message: 'first' }]
                    },
                    next: null
                }
            }, {
                match: -1,
                partial: false,
                dive: [ 0, 0 ],
                test: { type: 'root' },
                next: {
                    dive: [ 0, Number.MAX_SAFE_INTEGER ],
                    test: {
                        type: 'Error',
                        patterns: [{ message: 'second' }]
                    },
                    next: null
                }
            }]
        }
    }, 'fork')
    okay(parse([ String, 'string' ], { display: true }), {
        match: -1,
        partial: false,
        dive: [ 0, 0 ],
        test: { type: 'root' },
        next: {
            dive: [ 0, Number.MAX_SAFE_INTEGER ],
            test: {
                type: 'string',
                patterns: [ 'string' ]
            },
            next: null
        }
    }, 'string')
})
