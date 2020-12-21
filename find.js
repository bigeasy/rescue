// The innner decend returns true if the the `node` would match a pattern, have
// itself or all its children removed, from consideration, this used to be
// called pruning, so let's call it pruning. The inner `descend` returns true if
// the node is pruned from the tree.

// There is special case with the root node. It is always a dummy node. When we
// start from a root error, we only need to check the return value of descend.

// When we reach a fork in the path we have to winnow the list of errors with
// calls to find. In this case we do not want the boolean value. We want to get
// a list of what matched and then remove that list of an ever shrinking list of
// errors. This is when we pass in an external `filtered`.

// This function depends on the structure created by the compiler. The compiler
// is descending the user's tree of logic, the pattern, while `find` descends
// the tree of errors.

//

const assert = require('assert')

const Prune = require('./prune')

module.exports = function (limit, dive, test, tree) {
    function vivify (source, parent) {
        if (source.type == 'cycle') {
            return { ...source, parent }
        } else {
            const node = { ...source, parent, id: tree.nodes.length, errors: [] }
            tree.nodes.push(node)
            for (const child of source.errors) {
                node.errors.push(vivify(child, node.id))
            }
            return node
        }
    }

    function find (found, limit, dive, test, node) {
        let forked = false

        function descend (node, dive, test, depth, path) {
            const index = node.index
            if (node.type == 'cycle') {
                if (~path.indexOf(index)) {
                    // You safely can add `1` to `MAX_SAFE_INTEGER`.
                    // https://tc39.es/ecma262/#sec-number.max_safe_integer
                    depth = Number.MAX_SAFE_INTEGER + 1
                } else {
                    let source = node
                    do {
                       source = tree.nodes[source.parent]
                    } while (source.index != index)
                    const parent = tree.nodes[node.parent]
                    const vivified = vivify(source, node.parent)
                    parent.errors.splice(parent.errors.indexOf(node), 1, vivified)
                    node = vivified
                }
            }
            if (depth > dive[1]) {
            } else if (depth < dive[0]) {
                node.errors.forEach(error => descend(error, dive, test, depth + 1, path))
            } else {
                const matches = test(tree.errors[node.index])
                if (matches == null) {
                    path = path.concat(index)
                    node.errors.forEach(error => descend(error, dive, test, depth + 1, path))
                } else if (Array.isArray(matches)) {
                    forked = true
                    assert(limit == -1, 'limit can only be specified in leaf alternates')
                    fork(found, matches, node)
                } else if (matches.dive.length == 0) {
                    found.push(node.id)
                } else {
                    path = []
                    const subDive = matches.dive.map(value => value == Number.MAX_SAFE_INTEGER ? value : value + depth + 1)
                    node.errors.forEach(error => descend(error, subDive, matches.test, depth + 1, path))
                }
            }
        }

        descend(node, dive, test, 0, [])

        return forked
    }

    function fork (found, matches, node) {
        for (const match of matches) {
            const _found = []
            const forked = find(_found, match.limit, match.dive, match.test, node)
            if (forked) {
                if (node.errors.length == 0) {
                    found.push.apply(found, _found)
                }
            } else {
                if ((limit == 0 && _found.length != 0) || (limit == -1 && _found.length == 1) || _found.length == limit) {
                    Prune(tree, _found)
                    found.push.apply(found, _found)
                }
            }
        }
    }

    const found = []
    fork(found, [{ limit, dive, test }], tree.node)
    if (tree.node.errors.length == 0) {
        return found
    }

    return null
}
