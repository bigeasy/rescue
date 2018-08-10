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
    var causes = Array.isArray(e.causes)
               ? e.causes
               : [ e.cause ]
    for (var i = 0, I = causes.length; i < I; i++) {
        if (causes[i] != null) {
            if (typeof causes[i] == 'object' && ! Array.isArray(causes[i])) {
                if (causes[i].message != null) {
                    node.causes.push(tree(causes[i], errors))
                } else if (
                    causes[i].cause != null &&
                    ! Array.isArray(causes[i].cause) &&
                    causes[i].cause.message != null
                ) {
                    node.causes.push(tree(causes[i].cause, errors))
                }
            }
        }
    }
    return node
}

module.exports = function (e) {
    var errors = []
    return {
        errors: errors,
        tree: tree(e, errors)
    }
}
