module.exports = function (tree, found) {
    for (const id of found) {
        let iterator = tree.nodes[id]
        while (iterator.parent != 0 && (iterator.id == id || iterator.errors.length == 0)) {
            const parent = tree.nodes[iterator.parent]
            parent.errors.splice(parent.errors.indexOf(iterator), 1)
            iterator = parent
        }
    }
}
