var slice = [].slice
var unshift = [].unshift

module.exports = function (regex, rescue) {
    var vargs = slice.call(arguments), dispatch = []
    while (vargs.length != 0) {
        if (Array.isArray(vargs[0])) {
            unshift.apply(vargs, vargs.shift())
        }
        var regex = vargs.shift()
        var rescue = vargs.shift()
        var $ = /^\/\^([$\w][$\w\d]*):/.exec(regex.toString())
        if ($) {
            dispatch.push({
                regex: regex,
                prefix: $[1] + ':',
                property: $[1],
                rescue: rescue
            })
        } else {
            dispatch.push({
                regex: regex,
                prefix: '',
                property: 'message',
                rescue: rescue
            })
        }
    }
    return function (error) {
        for (var i = 0, I = dispatch.length; i < I; i++) {
            var branch = dispatch[i]
            if (branch.regex.test(branch.prefix + error[branch.property])) {
                return branch.rescue.apply(this, slice.call(arguments))
            }
        }
        throw error
    }
}
