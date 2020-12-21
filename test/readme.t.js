// # Rescue

// ## Adovacy

// Rescue will catch an eception or rethrow it. It can be used as a stand-in for
// the catch-by-type facility found in other languages. In addition to catching
// by type you can catch by message, properties, or the types and properties of
// nested messages in an aggregate error.

// I use rescue because I use code coverage to drive my testing and testing to
// drive my development. When I'm done with a module I want to have 100% code
// coverage. Exceptions, however, can be difficult to cover. Catch blocks are
// not difficult to test for the case where you handle the caught exception.
// This is an error you're expecting, so you can probably get your test
// environment into an expected error state.

// Catch blocks are difficult to test for the exceptions you're not expecting.
// In JavaScript a catch block cannot filter the type of exception to catch. It
// must catch all exceptions. Every catch blocks that handles an exception,
// truly handles, and attempts to recover, must also have throw statement to
// rethrow the excpetion if it not the correct type.

// Rescue also helps you when handling nested exceptions. You're able to express
// search patterns to find nested exceptions. If the message you want to handle
// has been wrapped by a module along the call stack, you do not have to
// navigate into `errors` properties knowing the depth of originating message.

// Rescue allows you to write a clean catch block without conditionals,
// extensive dereferencing or an explicit rethrow.

// ## Running the Readme

// This readme document is a unit test from the Rescue source code. It uses the
// [Proof](https://github.com/bigeasy/proof) unit test framework. We'll be using
// the `okay` method from Proof to assert the points we make about Rescue.

// Please run this test yourself.
//
// ```text
// git clone git@github.com:bigeasy/interrupt.git
// cd interrupt
// npm install --no-package-lock --no-save
// node test/readme.t.js
// ```
//
// Out unit test begins here.

//
require('proof')(38, okay => {
    // We are going to use Node.js assert to make sure we do not overshoot a
    // line that should have raised an exception.

    //
    const assert = require('assert')
    //

    // To use Rescue install it from NPM using the following.
    //
    // ```text
    // npm install rescue
    // ```
    //
    // Then you can begin to use it in your code as follows.
    //
    // ```javascript
    // const rescue = require('rescue')
    // ```
    //
    // But here, because we're in our project directory, we require Rescue by
    // requiring the root of the project.

    //
    const rescue = require('..')
    //

    // This example will catch any error that is an `Error` and not any other
    // Object type or JavaScript primitive.

    //
    try {
        throw new Error('thrown')
    } catch (error) {
        const { code, errors: [ caught ] } = rescue(error, [ Error ])
        okay(code, 'rescue', 'default rescued code')
        okay(caught.message, 'thrown', 'rescued object')
    }
    //

    // When you catch an error you receive a `Rescue` object. The object has a
    // `code` which is `rescue` by default. It also has an array of all the
    // errors that matched the pattern. Using destructuring you can easily get a
    // single error into a variable.

    // If the pattern does not match, rescue rethrows the exception.

    //
    try {
        try {
            throw new Error('flung')
        } catch (error) {
            rescue(error, [ 'thrown' ])
            assert(false)
        }
    } catch (error) {
        okay(error.message, 'flung', 'exception was not rescued')
    }
    //

    // In the above example we tried to catch for message type.

    // To catch an error my message you use a String. Put a string in your
    // pattern and it will be matched against the message property of the
    // `Error`.

    //
    try {
        throw new Error('thrown')
    } catch (error) {
        const { code, errors: [ caught ] } = rescue(error, [ 'thrown' ])
        okay(code, 'rescue', 'catch by message default rescue code')
        okay(caught.message, 'thrown', 'catch by message caught error')
    }
    //

    // When you specify a `String`, `rescue` will assume you mean to match an
    // `Error` and will only match objects of type `Error.

    //
    try {
        try {
            throw { message: 'thrown' }
        } catch (error) {
            rescue(error, [ 'thrown' ])
            assert(false)
        }
    } catch (error) {
        okay(error, { message: 'thrown' }, 'rescue assumed an error and asserted an error type')
    }
    //

    // You can also match the message by a regular expression.

    //
    try {
        throw new Error('an exception was thrown')
    } catch (error) {
        rescue(error, [ /thrown/ ])
        okay('exeption caught by regular expression on message')
    }
    //

    // You can match properties on an object by specifying them as an object
    // with a value to match. This will be a deep strict equality so you can
    // compare arrays and objects.

    //
    try {
        const error = new Error('file not found')
        error.code = 'ENOENT'
        throw error
    } catch (error) {
        rescue(error, [ { code: 'ENOENT' } ])
        okay('exception caught by property')
    }
    //

    // You can also use a regular expression to match properties. The regular
    // expression will be applied to the `.toString()` value of the property.

    // You can only specify a regular expression at the top-most level. If you
    // nest a regular expression it will be compared using deep strict equal
    // as a part of the complex object.

    //
    try {
        const error = new Error('file not found')
        error.code = 'ENOENT'
        throw error
    } catch (error) {
        rescue(error, [ { code: /ENOENT/ } ])
        okay('exception caught by regular expression on a property')
    }
    //

    // You can a subset of any property in an object. You can provide an object
    // and you'll rescue the exception if a subset of that object exists in the
    // specified property.

    //
    try {
        const error = new Error('file not found')
        error.state = { code: 'ENOENT', severity: 1 }
        throw error
    } catch (error) {
        rescue(error, [ { state: { code: 'ENOENT' } } ])
        okay('exception caught by subset of property')
    }
    //

    // The object you provide is a pattern to match. You can use regular
    // expressions at any depth in the pattern.

    //
    try {
        const error = new Error('file not found')
        error.state = { code: 'ENOENT', severity: 1 }
        throw error
    } catch (error) {
        rescue(error, [ { state: { code: /ENOENT/ } } ])
        okay('exception caught by subset of property')
    }
    //

    // When `rescue` applies your pattern to the error it actually searches for
    // the error. If the error has an `errors` property, it will test those
    // errors for an error that matchs.

    //
    try {
        try {
            throw new Error('child')
        } catch (error) {
            const wrapper = new Error('parent')
            wrapper.errors = [ error ]
            throw wrapper
        }
    } catch (error) {
        rescue(error, [ 'child' ])
        okay('matched a wrapped error')
    }
    //

    // If you do not want to search in depth you can specify a maximum depth to
    // search. Zero will test the only the root exception. An integer of zero or
    // greater will be interpreted as maxium depth.

    //
    try {
        try {
            try {
                throw new Error('child')
            } catch (error) {
                const wrapper = new Error('parent')
                wrapper.errors = [ error ]
                throw wrapper
            }
        } catch (error) {
            rescue(error, [ 0, 'parent' ])
            okay('match only at the current level')
            rescue(error, [ 0, 'child' ])
            assert(false)
        }
    } catch (error) {
        okay(error.message, 'parent', 'did not search children')
    }
    //

    // You can also specify a minimum depth to search. To do you you specify
    // both a minimum and maximum. They must both be integers of zero or
    // greater. The first integer is used for the minimum depth, the second
    // integer is used as the maxium depth.

    //
    try {
        try {
            try {
                throw new Error('child')
            } catch (error) {
                const wrapper = new Error('parent')
                wrapper.errors = [ error ]
                throw wrapper
            }
        } catch (error) {
            rescue(error, [ 1, 1, 'child' ])
            okay('match at the second level')
            rescue(error, [ 1, 1, 'parent' ])
            assert(false)
        }
    } catch (error) {
        okay(error.message, 'parent', 'did match root error')
    }
    //

    // If you want to start at a specific minimum but do not want to stop at any
    // particular maximum you can use `Infinity` for the maximum.

    //
    try {
        try {
            try {
                throw new Error('child')
            } catch (error) {
                const wrapper = new Error('parent')
                wrapper.errors = [ error ]
                throw wrapper
            }
        } catch (error) {
            rescue(error, [ 1, Infinity, 'child' ])
            okay('match at the second level infinate search')
            rescue(error, [ 1, Infinity, 'parent' ])
            assert(false)
        }
    } catch (error) {
        okay(error.message, 'parent', 'did match root error infinate search')
    }
    //

    // You can specify a parent/child relationship. You can match parent
    // properties and child properties. When you specify `Error` in the pattern
    // it is partition. It indicates that you are specifying a match for a child.

    //
    try {
        try {
            throw new Error('child')
        } catch (error) {
            const wrapper = new Error('parent')
            wrapper.errors = [ error ]
            throw wrapper
        }
    } catch (error) {
        rescue(error, [ 'parent', Error, 'child' ])
        okay('rescued a parent by message and a child by message')
    }
    //

    // You can specify depths after a partition as well.

    //
    try {
        try {
            try {
                try {
                    throw new Error('child')
                } catch (error) {
                    const interloper = new Error('interloper')
                    interloper.errors = [ error ]
                    throw interloper
                }
            } catch (error) {
                const wrapper = new Error('parent')
                wrapper.errors = [ error ]
                throw wrapper
            }
        } catch (error) {
            rescue(error, [ 'parent', Error, 'child' ])
            okay('rescued a parent by message and a child by message with no specified depth')
            rescue(error, [ 'parent', Error, 0, 'child' ])
            assert(false)
        }
    } catch (error) {
        okay(error.message, 'parent', 'did not rescue when child depth specified')
    }
    //

    // Rescue assumes you only want to match a single instance of the specified
    // exception. If you expect specific an number other than one you can
    // specify that number in an array as the first element in the pattern
    // array.

    //
    try {
        try {
            const error = new Error('aggregate')
            error.errors = [ new Error('thrown'), new Error('thrown') ]
            throw error
        } catch (error) {
            const wrapper = new Error('parent')
            wrapper.errors = [ error ]
            throw wrapper
        }
    } catch (error) {
        const errors = rescue(error, [ [ 2 ], 'thrown' ]).errors
        okay(errors.length, 2, 'caught two errors')
    }
    //

    // If you are expecting more than one error but don't know exactly how many
    // you can use zero to match all of them.

    //
    try {
        try {
            const error = new Error('aggregate')
            error.errors = [ new Error('thrown'), new Error('thrown'), new Error('thrown') ]
            throw error
        } catch (error) {
            const wrapper = new Error('parent')
            wrapper.errors = [ error ]
            throw wrapper
        }
    } catch (error) {
        const errors = rescue(error, [ [ 0 ], 'thrown' ]).errors
        okay(errors.length, 3, 'caught all the errors')
    }
    //

    // `rescue` will only match if there are no forks in the path to the
    // exception. If there are siblings (or cousins) to the exception you match,
    // `rescue` will rethrow the exception.

    //
    try {
        try {
            try {
                const error = new Error('aggregate')
                error.errors = [ new Error('first'), new Error('second') ]
                throw error
            } catch (error) {
                const wrapper = new Error('parent')
                wrapper.errors = [ error ]
                throw wrapper
            }
        } catch (error) {
            rescue(error, [ 'parent', Error, 0, 'aggregate' ])
            okay('caught before the fork in the path')
            rescue(error, [ 'parent', Error, 0, 'aggregate', Error, 0, 'first' ])
            assert(false)
        }
    } catch (error) {
        okay(error.message, 'parent', 'did not catch exception because other forks in the path exist')
    }
    //

    // If you want to match two different types of error you specify a fork
    // using an array as the last element of your pattern. The array contains
    // the separeate patterns to match at that point in the error tree.

    //
    try {
        try {
            const error = new Error('aggregate')
            error.errors = [ new Error('first'), new Error('second') ]
            throw error
        } catch (error) {
            const wrapper = new Error('parent')
            wrapper.errors = [ error ]
            throw wrapper
        }
    } catch (error) {
        rescue(error, [ 'aggregate' ])
        okay('caught before the fork in the path')
        rescue(error, [ 'aggregate', [[ 'first' ], [ 'second' ]] ])
        okay('rescued matching both children')
    }
    //

    // Your fork must match all the different possible errors. If it doesn't
    // than the exception is rethrown.

    // **TODO** As of yet, I have no way of specifying a partial match, to say,
    // yes I want to rescue if this exists and I dont' care about anything else.
    // I am going to use Rescue as it is for a while and see if I don't
    // encounter that use case before I implement it.

    //
    try {
        try {
            try {
                const error = new Error('aggregate')
                error.errors = [ new Error('first'), new Error('second'), new Error('third') ]
                throw error
            } catch (error) {
                const wrapper = new Error('parent')
                wrapper.errors = [ error ]
                throw wrapper
            }
        } catch (error) {
            rescue(error, [ 'aggregate', [[ 'first' ], [ 'second' ]] ])
            okay('rescued matching both children')
        }
    } catch (error) {
        okay(error.message, 'parent', 'fork did not match all possible errors')
    }
    //

    // If you would like to catch more than one type of exception, you pass an
    // object to `rescue`. Each property is a rescue pattern. Each property is
    // applied in the enumeration order of the object, which is going to be the
    // same as the declaration order in contemporary JavaScript. The first one
    // that matches is returned.

    // The result is an object with a `code` property that contains the property
    // name of the pattern that matched, and an `errors` property that is an
    // array of the errors that matched.

    // You can then use the `code` in a switch statement. This is starts to look
    // like the catch by type facility in other languages, with the added
    // benefit of being able to dive into exception trees and inspect the types
    // and properties of nested exceptions.

    // Furthermore, this satisfies the original object of Rescue. If you unit
    // test the expected error paths, this catch block will be fully covered.

    //
    try {
        const error = new Error('child')
        error.errors = [ new Error('second') ]
        throw error
    } catch (error) {
        const { code, errors: [ caught ] } = rescue(error, {
            first: [ 'child', Error, 'first' ],
            second: [ 'child', Error, 'second' ]
        })
        switch (code) {
        case 'first':
            assert(false)
            break
        case 'second':
            okay(caught.message, 'second', 'matched alternative')
            break
        }
    }
    //

    // Exceptions can be any type in JavaScript and rescue can catch any type of
    // exception. You specify a non-error exception by giving a constructor,
    // optional depth arguments, and then an optional value.

    // Here is how you would catch an error that was a string.

    //
    try {
        throw 'thrown'
    } catch (error) {
        const string = rescue(error, [ String, 'thrown' ]).errors.shift()
        okay(string, 'thrown', 'caught a string')
    }
    //

    // Similarly, you can catch a number by value.

    //
    try {
        throw 1
    } catch (error) {
        const value = rescue(error, [ Number, 1 ]).errors.shift()
        okay(value, 1, 'caught a number')
    }
    //

    // You do not have to specify a value to catch by type. You can simply
    // specify the type.

    //
    try {
        throw false
    } catch (error) {
        const value = rescue(error, [ Boolean ]).errors.shift()
        okay(value, false, 'caught a boolean by type')
    }
    //

    // You can catch symbols. You can specify these primitive types at any level
    // of the pattern.

    //
    try {
        try {
            throw Symbol.iterator
        } catch (error) {
            const wrapper = new Error('thrown')
            wrapper.errors = [ error ]
            throw wrapper
        }
    } catch (error) {
        const value = rescue(error, [ 'thrown', Symbol, Symbol.iterator ]).errors.shift()
        okay(value, Symbol.iterator, 'catch symbol')
    }
    //

    // You can catch BigInts.
    //
    try {
        throw 1n
    } catch (error) {
        const value = rescue(error, [ BigInt, 1n ]).errors.shift()
        okay(value, 1n, 'caught a BigInt')
    }
    //

    // Rescue can even handle circular references in your error heirarchy.

    //
    try {
        const raised = new Error('raised')
        const thrown = new Error('thrown')
        raised.errors = [ thrown ]
        thrown.errors = [ raised ]
        throw thrown
    } catch (error) {
        const caught = rescue(error, [ 'thrown', Error, 'raised', Error, 'thrown', Error, 'raised', Error, 'thrown' ]).errors.shift()
        okay(caught.message, 'thrown', 'matched through a circular reference')
    }
    //

    // An even uglier case.

    //
    try {
        const thrown = new Error('thrown')
        thrown.errors = [ thrown ]
        throw thrown
    } catch (error) {
        const caught = rescue(error, [ 'thrown', Error, 'thrown', Error, 'thrown', Error, 'thrown', Error, 'thrown' ]).errors.shift()
        okay(caught.message, 'thrown', 'matched through a self reference')
    }
    //

    // No problem if we don't match, even though rescue searches for infinate
    // depth. It will detect the cycle and give up.

    //
    try {
        try {
            const raised = new Error('raised')
            const thrown = new Error('thrown')
            raised.errors = [ thrown ]
            thrown.errors = [ raised ]
            throw thrown
        } catch (error) {
            rescue(error, [ 'error' ])
            assert(false)
        }
    } catch (error) {
        okay(error.message, 'thrown', 'did not catch a circular reference that didn\'t match')
    }
    //

    // Circular references are tricky, however. When rescue matches a path in a
    // fork it prunes it from the heirarchy so it won't be matched a second
    // time. Circular references can cause us to prune the path we followed to
    // get to the fork.

    // This is exceedingly uncommon. Circular references in error heirarchies
    // are exceedingly rare. The chances that you'd compose a pattern that does
    // this is also unlikely. You can still take control of the pattern so that
    // it doesn't cause problems.

    // Here we fork after thrown and first remove raised then remove flung.

    // **TODO** Inserting partial matches here.

    // As noted, you have to match the entire pattern in or else rescue will
    // rethrown the error. This is the default behavior and it is good because
    // without it, you may be swallowing exceptions. If you're certain you can
    // ignore the other exceptions you can indicate that you want to perform a
    // partial match by specifying a limit and prefixing it with the bitwise NOT
    // operator `~`.

    // The mnemonic is that a tilde `~` in the writing can be used to mean
    // "approximately" and we're happy to match something, but not exactly.

    //
    try {
        const error = new Error('aggregate')
        error.errors = [ new Error('first'), new Error('second') ]
        throw error
    } catch (error) {
        const caught = rescue(error, [ [ ~1 ], 'first' ]).errors.shift()
        okay(caught.message, 'first', 'matched first message ingored second')
    }

    return
    //
    try {
        const raised = new Error('raised')
        const thrown = new Error('thrown')
        const flung = new Error('flung')
        raised.errors = [ thrown ]
        thrown.errors = [ raised, flung ]
        throw thrown
    } catch (error) {
            debugger
        const caught = rescue(error, [ 'thrown', Error, 'raised', Error, 'thrown', [[ 'raised' ], [ 'flung' ]] ]).errors
        console.log(caught.map(error => error.message))
    }
    // **TODO** Close. Still something to do with the proper parent. Here we are
    // removing thrown, but when we match we do not reoving it from raised, we
    // remove it from the root. Also, a missed match with infinate depth would
    // search forever, so we have to have a terminator inside find so taht we do
    // not repeat a cycle when finding, so I suppose we keep a path, and that
    // path is probably concerned with parents as well.

    // **TODO** Okay. How about... What if... When we decend the tree looking
    // for a node, when we encounter a cycle we replace the node by constructing
    // it. If we match we reset a cycle counter. If we do not match then when we
    // hit a cycle again we give up on that path. The cycle counter could be a
    // path instead of a counter, we search to see if we've already seen this
    // node. If so, we give up. When we match we reset the path to no path.

    // So we tell the user the when there are circular references, for the
    // purposes of search, we vivify this tree in order to match it. That way,
    // if we prune the tree when we match, we do not prune ealier matches. That
    // is if the root a has chilren [ a, b ] and we search [ a, a, [ a, b ]] we do not
    // satisfy the match all condition becasue we matched the second `a` has a
    // `b` sibling that was not matched.

    // We will not blow the stack because we are driven by the pattern which can
    // detect the cycles and know that a particlar search his hopeless.

    // **TODO** Got it all working. Circular reference documentation will be
    // difficult, but matching circular references will also be difficult, so..
    return
    try {
        const raised = new Error('raised')
        const thrown = new Error('thrown')
        const flung = new Error('flung')
        thrown.errors = [ raised, flung ]
        raised.errors = [ thrown ]
        throw thrown
    } catch (error) {
        debugger
        const caught = rescue(error, [ 'thrown', Error, [[ 'raised', Error, 'thrown', Error, 'raised', Error, 'thrown' ], [ 'flung' ]] ]).errors
        console.log(caught.map(error => error.message))
    }
})
