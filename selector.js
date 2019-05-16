const tree = require('./tree')

class Selector {
    constructor (e) {
        this._tree = tree(e)
        this._found = []
    }

    _dip (node, i, path, index, depth, dive) {
        if (this._prune(node.causes[i], path, index, depth + 1, dive)) {
            node.causes.splice(i, 1)
            return i
        }
        return i + 1
    }

    _prune (node, path, index, depth, dive) {
        if (path.length == index) {
            this._found.push(node.index)
            return true
        }
        if (depth > dive[1] || node.causes.length == 0) {
            return false
        }
        let i = 0
        for (;;) {
            if (i == node.causes.length) {
                break
            }
            if (depth < dive[0]) {
                i = this._dip(node, i, path, index, depth, dive)
            } else {
                const match = path[index](this._tree.errors[node.causes[i].index])
                if (match == null) {
                    i = this._dip(node, i, path, index, depth, dive)
                } else {
                    const subDive = match.map(offset => index + offset + 1)
                    if (this._prune(node.causes[i], path, index + 1, depth + 1, subDive)) {
                        node.causes.splice(i, 1)
                    } else {
                        i++
                    }
                }
            }
        }
        return node.causes.length == 0
    }

    prune (path, dive) {
        this._prune(this._tree, path, 0, 0, dive)
        return this._found.map((index) => this._tree.errors[index])
    }

    get empty () {
        return this._tree.causes.length == 0
    }
}

module.exports = Selector
