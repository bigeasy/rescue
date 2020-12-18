module.exports = function (e) {
    function tree (e, ordered, parent) {
        let index = ordered.indexOf(e)
        if (!~index) {
            index = ordered.length
            ordered.push(e)
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
                node.errors.push(tree(errors[i], ordered, node.id))
            }
        }
        return node
    }
    const ordered = [], nodes = [ null, null ]
    const node = {
        ordered: ordered,
        nodes: nodes,
        parent: 0,
        errors: [ tree(e, ordered, 1) ]
    }
    nodes[1] = node
    return node
}
