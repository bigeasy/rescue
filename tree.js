module.exports = function (e) {
    function tree (e, ordered, parent, path) {
        let index = ordered.indexOf(e)
        if (!~index) {
            index = ordered.length
            ordered.push(e)
        }
        const seen = path.indexOf(index)
        if (~seen) {
            return { type: 'cycle', index: index, parent: parent }
        }
        const node = {
            id: nodes.length,
            index: index,
            message: e instanceof Error ? e.message : e.toString(),
            parent: parent,
            errors: []
        }
        nodes.push(node)
        if (e instanceof Error) {
            const errors = Array.isArray(e.errors) ? e.errors : []
            for (let i = 0, I = errors.length; i < I; i++) {
                node.errors.push(tree(errors[i], ordered, node.id, path.concat(index)))
            }
        }
        return node
    }
    const node = {
        index: '?',
        parent: 0,
        errors: null
    }
    const errors = [], nodes = [ null, node ]
    nodes[1].errors = [ tree(e, errors, 1, []) ]
    return { node, errors, nodes }
}
