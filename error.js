module.exports = require('interrupt').create('Rescue.Error', {
    PARSE_ERROR: {},
    TOO_MANY_RANGES: {
        code: 'PARSE_ERROR',
        message: 'too many ranges in pattern, must be max or min, max'
    },
    RANGES_OUT_OF_ORDER: {
        code: 'PARSE_ERROR',
        message: 'the min range must be less than or equal to the max range'
    }
})
