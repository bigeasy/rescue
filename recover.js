module.exports = function (block, regex, rescue) {
    var $ = /^\/\^([$\w][$\w\d]*):/.exec(regex.toString()), prefix, first, second
    if ($) {
        prefix = $[1] + ':'
        first = second = $[1]
    } else {
        prefix = ''
        first = 'code'
        second = 'message'
    }
    return [block, function (error) {
        if (regex.test(prefix + (error[first] || error[second]))) {
            rescue(error)
        } else {
            throw error
        }
    }]
}
