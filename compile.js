const semblance = require('semblance')

function sortof (value) {
    if (value == null) {
        return null
    }
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

function condition (test) {
    const conditions = []
    if (test.type != 'root') {
        if (typeof test.type == 'string') {
            conditions.push(value => sortof(value) == test.type)
        } else {
            conditions.push(value => value instanceof test.type)
        }
        for (const pattern of test.patterns) {
            conditions.push(value => semblance(value, pattern))
        }
    }
    return conditions
}

function compile ({ test, next }) {
    const conditions = condition(test)
    const descend = next == null
        ? { dive: [] }
        : Array.isArray(next)
            ? next.map(next => {
                return { match: next.match, dive: next.dive, test: compile(next) }
            })
            : { dive: next.dive, test: compile(next) }
    return function (object) {
        if (conditions.every(condition => condition(object))) {
            return descend
        }
        return null
    }
}

module.exports = function (ast) {
    return { match: ast.match, partial: ast.partial, dive: ast.dive, test: compile(ast) }
}
