// I can get more out of the language if I get rid of all the function call
// stuff. Just return a match. The common case for `rescue` is that there is a
// specific type of error I'm okay with.

//
function safeParse (json) {
    try {
        return JSON.parse(json)
    } catch (error) {
        rescue(error, [ SyntaxError ])
        return null
    }
}

// But I've imagined that there are cases where I want to dive in to nested
// `Interrupt` exceptions.

//
function recoverable () {
    try {
        func()
    } catch (error) {
        const { errors: [ error ] } = rescue(error, [{ code: 'SYSTEM_FUNKY' }])
        return error.funkifyLevel
    }
}

// Now I ought ot have space to use the complete match versus partial match. But
// that means some how winnowing.

//
function recoverable () {
    try {
    } catch (error) {
        const rescued = rescue(error, [ Destructible.Error, Error, { code: 'ENOENT' } ]
        rescue(rescued, [ Destructible.Error, Error: { code: 'EACESS' } ])
    }
}

// I dunno. Rescue is kind of a mess anyway, why not create an object to perform
// the tests?

//
function recoverable () {
    try {
    } catch (error) {
        const rescue = new Rescue(error)
        rescue.match([ Destructible.Error, SyntaxError ])
        rescue.match([ Destructible.Error, Error, 'ENOENT' ])
        rescue.complete
    }
}

// Because I hate it. What else is there?

//
function recoverable () {
    try {
    } catch (error) {
        const rescued = rescue(error, [
            [ Destructible.Error, SyntaxError ], 'syntax'
        ])
        switch (rescued.select) {
        case 'syntax':
            rescued.rescue([ Destructible.Error, Error, { code: 'ENOENT' })
            rescued.complete
            return 'rescued a syntax error'
            break
        }
    }
}

// Which allows for the very common case of above. And this which I always
// imagined was something I wanted.

// The advantage is that the rethrow happens automatically. This is for my code
// coverage fetish and no one else will appreciate it the way I do.

//
function recoverable () {
    try {
        func()
    } catch (error) {
        const rescued = rescue(error, [
            [ SyntaxError ], 'syntax',
        ], [
            [ Error, { code: 'ENOENT' } ], [ DatabaseError ], 'io'
        ])
        switch (rescued.result) {
        case 'syntax':
            return 'fix your syntax'
        case 'io':
            return 'file system corrupt, abort, retry, fail?'
        }
    }
}

// OMG. If we're just returning codes...

//
function recoverable () {
    const { code } = rescue(error, {
        syntax: SyntaxError,
        read: [ Error, { code: 'EACESS' } ],
        io: [[ Error, { code: 'ENOENT' } ], [ DatabaseError ]]
    }, { partial: false })
    switch (rescued.code) {
    case 'syntax':
        return 'that ain\'t the way I heard it'
    case 'read':
        return 'the approriate authorities have been notified'
    case 'io':
        return 'file system corrupt, abort, retry, fail?'
    }
}

// Okay, so what about matching trees?

//
function recoverable () {
    try {
    } catch (error) {
        const rescued = rescue(error, {
            io: [ Error, { code: /^E/ } ],
            syntax: [ Destructible.Error, SyntaxError ]
        }, { partial: true })
        switch (rescued.code) {
        case 'syntax':
            rescued.rescue([ Destructible.Error, Error, { code: 'ENOENT' } ])
            rescued.complete
            return 'rescued a syntax error'
        default:
            rescued.complete
            return null
        }
    }
}

// In truth, the tree example is so specific. Really, you're never going to be
// matching a great big bunch of these things, you put your try/catch close to
// the source.

// It's a function builder now, so what does that allow us? Another set of
// parameters so we can pass in partial there.

//
function recoverable () {
    try {
    } catch (error) {
        const rescued = rescue({
            io: [ Error, { code: /^E/ } ],
            syntax: [ Destructible.Error, SyntaxError ]
        })(error, { partial: true })
        switch (rescued.code) {
        case 'syntax':
            rescued.rescue([ Destructible.Error, Error, { code: 'ENOENT' } ])
            rescued.complete
            return 'rescued a syntax error'
        default:
            rescued.complete
            return null
        }
    }
}
//

// Ors can be arrays, I think. We do have functions as a fallback. No more
// function invocation, that was silly, and matching trees is going to have to
// be a mess, which is what we see below.

//
function recoverable () {
    try {
    } catch (error) {
        const rescued = rescue({
            io: [ Error, { code: /^E/ } ],
            syntax: [ Destructible.Error, SyntaxError ]
        })(error, { partial: true })
        switch (rescued.code) {
        case 'syntax':
            rescued.rescue([ Destructible.Error, Error, { code: 'ENOENT' } ])
            rescued.complete
            return 'rescued a syntax error'
        default:
            rescued.complete
            return null
        }
    }
}

function recoverable () {
    try {
    } catch (error) {
        const rescued = rescue({
            io: [ Error, { code: /^E/ } ],
            syntax: [ Destructible.Error, 0, 0, [ [ SyntaxError ], [{ code: 'ENOENT' }] ] ]
        })(error, { partial: true })
        switch (rescued.code) {
        case 'syntax':
            rescued.rescue([ Destructible.Error, Error, { code: 'ENOENT' } ])
            rescued.complete
            return 'rescued a syntax error'
        default:
            rescued.complete
            return null
        }
    }
}
