module.exports = require('interrupt').create('Rescue.Error', {
    PARSE_ERROR: {},
    TOO_MANY_RANGES: {
        code: 'PARSE_ERROR',
        message: 'too many ranges in pattern, must be max or min, max'
    },
    RANGES_OUT_OF_ORDER: {
        code: 'PARSE_ERROR',
        message: 'the min range must be less than or equal to the max range'
    },
    PATTERN_TYPE_ERROR: {
        code: 'PATTERN_TYPE_ERROR',
        message: 'a %(_mode)s match pattern cannot accept an argument of type %(_type)s'
    }
})
