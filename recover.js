module.exports = function (block, regex, rescue) {
    var property = /^\/\^([$\w][$\w\d]*):/.exec(regex.toString())[1]
    return [block, function (error) {
        if (regex.test(property + ':' + error[property])) {
            rescue(error)
        } else {
            throw error
        }
    }]
}
