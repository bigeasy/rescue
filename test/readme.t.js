require('proof', async okay => {
    // Rescue is an accommodation for my code coverage fetish. When I write code
    // I use coverage driven design, which means that I write code first, write
    // tests second and then rework my tests **and** my code until coverage is
    // 100%.

    // This would be an extreme opposite to coverage driven design. Running
    // coverage on unit tests has revealed such gems as this.

    function bar () {
        let foo = 1

        /* a lot of code goes here... */

        if (foo == null) {
            console.log('WARNING: foo must not be null')

            /* a lot of cope goes here... */

            return 0
        }

        return foo + 1
    }
    //

    // Yes, I've seen it in the wild. This is called defensive programming. It
    // used to be a thing. This cannot be unit tested of course, and there will
    // be no coverage of the `null` `foo` branch.

    // Why are you testing if `foo` is null and rolling back the work? Because
    // if `foo` is `null` then the return value is `NaN` which would be invalid.
    // But, you set `foo` at the start of the function, how is it ever going to
    // be `null`. Someone might edit the code and remove the initialization of
    // `foo`. We can't cover that branch in uint testing. So? You don't want the
    // code to crash in production? If we don't unit test the recover code, how
    // do we know **it** won't crash in production?

    // What does this have to do with rescue?

    // I've written this code before. If the body parses to JSON, treat it as
    // JSON, otherwise leave it as it is.

    //
    {
        function safeParse (json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                if (!(error instanceof SyntaxError)) {
                    throw error
                }
                return json
            }
        }
    }
    //

    // This is why I wrote `rescue`.

    //
    {
        function safeParse (json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                rescue([ SyntaxError ])(error)
                return json
            }
        }
    }
    //

    // You could unit test this by making `JSON` a parameter to `safeParse` and
    // unit testing `safeParse` with a mock `JSON` that throws a plain `Error`.

    //
    {
        function safeParse (JSON, json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                if (!(error instanceof SyntaxError)) {
                    throw error
                }
                return json
            }
        }

        MockJSON = {
            parse: function () { throw new Error('unexpected') }
        }

        try {
            safeParse(MockJSON, json)
        } catch (error) {
            okay(error.message, 'unexpected', 'rethrow unexpected error')
        }
    }
    //

    // A trivial example, couldn't we just assert that error is a `SyntaxError`?

    //
    {
        function safeParse (json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                assert(error instanceof SyntaxError)
                return null
            }
        }

        okay(safeParse('{}'), {}, 'safe parse with assertion')
    }
    //

    // But, now we're not rethrowing. We're throwing `SyntaxError`. I'd really
    // like to see what that error was. Could interpoate the error name into the
    // assertion message, but I prefer `rescue`, of course.

    //

    // What if we just don't care?

    //
    {
        function safeParse (json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                return null
            }
        }

        okay(safeParse('{}'), {}, 'safe parse with assertion')
    }
    //

    // Can't we just read Crockford's code and see that it won't throw anything
    // other than a `SyntaxError`?

    // Yes, all of the caveats above are true for a trival example. Imagine now
    // you're calling some monster legacy function that has been throwing a
    // strange exception in production. You perform an arduous code review and
    // figure out how to catch and recover. Now you have the options above,
    // assert the expected error, mock the code in your try block and make it a
    // parameter, or swallow everything or, heaven forefend, leave the rethrow
    // branch uncovered in your unit tests.

    // What I've come up with is essentially this.

    //
    {
        function IS_SYNTAX_ERROR (error) {
            if (!(error instanceof SyntaxError)) {
                throw error
            }
        }

        function safeParse (json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                IS_SYNTAX_ERROR(error)
                return null
            }
        }

        okay(safeParse('{}'), {}, 'safe parse success')
        okay(safeParse('!'), null, 'safe parse failure')
        try {
            IS_SYNTAX_ERROR(new Error('unknown'))
        } catch (error) {
            okay(error.message, 'unknown')
        }
    }
    //

    // There you go, code with a unit test that gives full coverage. Cool, but
    // what does `rescue` do? It does what you see above, below.

    //
    {
        function safeParse (json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                rescue([ SyntaxError ])(error)
                return null
            }
        }

        okay(safeParse('{}'), {}, 'safe parse success')
        okay(safeParse('!'), null, 'safe parse failure')
    }
    //

    // Code with a unit test that gives you full coverage.

    // As a final point of advocacy. Every other language I've used has a catch
    // by type feature. It requires that you declare an exception class
    // heirarchy to use, but they all have them.

    // JavaScript code is usually pretty bad about defining their exceptions.
    // More often than all you have is `Error` with a cheeky message to go by.
    // The `fs` module of Node.js throws `error` with a POSIX error code in the
    // `code` property. So `rescue` has to match not only classes, but also
    // messages and properties, so that's why things got a little out of hand.

    // This ends the advocacy for Rescue. Let us begin the defense of Rescue.

    // If you found yourself reading this you're probably reviewing something
    // I've written and you would like to know how much this fetish of mine is
    // going to cost you. Let's look at `safeParse` and ask ourselves how much
    // slower is `rescue` compared to an `instanceof` statement.

    // Quite a bit actually. If you where only ever to call it directly you'd
    // see that it is two orders of magnitude slower and then some.

    // But, you're never going to call it directly, you're only going to use it
    // in a `catch` block where its effect over all performance minimal.
    // `try`/`catch` is slow, that's all there is to it.

    // When exceptions are truly exceptional it won't matter at all. Something
    // bad happened and you're code is scrambling to recover.

    // In our `safeParse` function, however, where we're expecting exceptions
    // as part of normal operation. The cost of `rescue` is minimal but it's not
    // negligable. This is why `rescue` is a function builder. It returns an
    // error matching function that you can hold onto. That way we can skip the
    // compilation step, the part where we convert our match pattern into a
    // function.

    //
    {
        const IS_SYNTAX_ERROR = rescue([ SyntaxError ])

        function safeParse (json) {
            try {
                return JSON.parse(json)
            } catch (error) {
                IS_SYNTAX_ERROR(error)
                return null
            }
        }

        okay(safeParse('{}'), {}, 'safe parse success')
        okay(safeParse('!'), null, 'safe parse failure')
    }
    //

    // Now the cost is negligable. It is, in fact, inexplicably faster in on my
    // workstation using the `benchmarks/memoized.js` benchmark in the
    // benchmarks directory.

    // If the catch block is an exceptional catch block or the code is not
    // critical I keep the match definition in the catch block. This is almost
    // always the case.

    //
    {
        function readOrCreateDir (dirname) {
            for (;;) {
                try {
                    return await fs.readdir(dirname)
                } catch (error) {
                    rescue([{ code: 'ENOENT' }])(error)
                    await fs.mkdir(dirname, { recursive: true })
                }
            }
        }
    }
    //

    // In the example above, the asynchronous file system operations are going
    // to be far slower than than the `rescue` call, and the `try/catch` block,
    // if activated is slower still. This example is inspired by database
    // initialization code, not on the critical path.

    // Also, you can see from this example that `rescue` can match by property.
    // We want to create the directory if it does not exist. If it is not a
    // directory `ENOTDIR`, it will throw an exception.

    // And that concludes my defense.

    //
    {
        try {
            throw new SyntaxError
        } catch (error) {
            rescue([ SyntaxError ])(error)
        }
    }
    //

    //
    {
        try {
            throw new Error('trouble')
        } catch (error) {
            rescue([ 'trouble' ])(error)
        }
    }
    //

    //
    {
        try {
            throw new Error('there has been trouble')
        } catch (error) {
            rescue([ /trouble/ ])(error)
        }
    }
    //

    //
    {
        try {
            throw new Error('ETROUBLE\n\nsystem status: troublesome\ntrouble level: acute')
        } catch (error) {
            rescue([ /^ETROUBLE$/m ])(error)
        }
    }
    //

    //
    {
        try {
        } catch (error) {
        }
    }
    //
})
