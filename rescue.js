// Couple of todos.

// **TODO** We can do a partial match with `[ [ ~1 ], 'thrown' ]`

// **TODO** We want to be able to handle circular references without blowing the
// stack, but they are still tricky. They will be difficult to document. They
// will be exceedingly rare, so it's not really our problem.

// **TODO** We want to nest the thrown exception in a `Rescue.Error` if there
// are errors in the pattern. If we are currying we throw exceptions
// immediately.

// **TODO** Do we `Rescue.rescue`? Yeah, probably. Then we have `Rescue.Error`
// and we can play around with the `Rescue` object.

// **TODO** Really need to clean up the parser for each type. Moved toward
// creating a common parser object.

// **TODO** Document subordinate and point the user over there.

class Rescue {
    constructor (code, errors) {
        this.code = code
        this.errors = errors
    }
}

const Tree = require('./tree')
const Parse = require('./parse')
const Compile = require('./compile')
const Find = require('./find')


function rescue (error, pattern) {
    const patterns = function () {
        if (Array.isArray(pattern)) {
            return { rescue: Compile(Parse(pattern)) }
        }
        const parsed = {}
        for (const code in pattern) {
            parsed[code] = Compile(Parse(pattern[code]))
        }
        return parsed
    } ()

    const f = function (error) {
        for (const code in patterns) {
            const compiled = patterns[code]
            const tree = Tree(error)
            const found = Find(compiled.match, compiled.dive, compiled.test, tree)
            if (found != null) {
                return new Rescue(code, found.map(id => tree.errors[tree.nodes[id].index]))
            }
        }
        throw error
    }
    if (error === rescue) {
        return f
    }
    return f(error)
}

module.exports = rescue
