var tree = require('./tree')

function Selector (e) {
    this._tree = tree(e)
}

Selector.prototype._prune = function (node, path, found) {
    if (path.length == 0) {
        found.push(node.index)
        return true
    }
    if (node.causes.length == 0) {
        return false
    }
    var i = 0
    for (;;) {
        if (i == node.causes.length) {
            break
        }
        var advance = path[0](node.causes[i])
        if (advance != -1 && this._prune(node.causes[i], path.slice(advance), found)) {
            node.causes.splice(i, 1)
        } else {
            i++
        }
    }
    return node.causes.length == 0
}

Selector.prototype.prune = function (path) {
    var found = []
    this._prune(this._tree, path, found)
    return found.length ? this._tree.errors[found.shift()] : null
}

Selector.prototype.isEmpty = function () {
    return this._tree.causes.length == 0
}

module.exports = Selector
