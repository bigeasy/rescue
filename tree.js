function tree (e, errors) {
    var index = errors.indexOf(e)
    if (!~index) {
        index = errors.length
        errors.push(e)
    }
    var node = {
        index: index,
        message: e.message,
        causes: []
    }
    var causes = Array.isArray(e.causes) ? e.causes : [ e.cause ]
    for (var i = 0, I = causes.length; i < I; i++) {
        if (causes[i] instanceof Error) {
            node.causes.push(tree(causes[i], errors))
        }
    }
    return node
}

module.exports = function (e) {
    var errors = []
    return {
        errors: errors,
        causes: [ tree(e, errors) ]
    }
}
