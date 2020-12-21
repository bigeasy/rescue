const subordinate = require('subordinate')

function sortof (value) {
    if (value == null) {
        return null
    }
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

function condition (test) {
    const conditions = []
    switch (test.type) {
    case 'root': {
            return conditions
        }
    case 'error': {
            conditions.push(e => e instanceof test.error)
            for (const pattern of test.patterns) {
                conditions.push(value => subordinate(value, pattern))
            }
            return conditions
        }
    case 'boolean':
    case 'number':
    case 'string': {
            conditions.push(value => typeof value == test.type)
            for (const pattern of test.patterns) {
                conditions.push(value => subordinate(value, pattern))
            }
            return conditions
        }
    case 'symbol': {
            conditions.push(value => sortof(value) == test.type)
            for (const pattern of test.patterns) {
                conditions.push(value => subordinate(value, pattern))
            }
            return conditions
        }
    }
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
