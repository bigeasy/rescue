## Rescue

Conditionally catch a JavaScript exception based on type and properties,

## A Pleading

Gentle user, you have stumbled upon a library that will seem to you to be a
silly little doodle of duplication, for what's wrong with the `if/else` ladder
that we all know and hate?

```javascript
class ConfigurableWidget extends Widget {
    configure (file) {
        try {
            // Set widget preferences with the configuration in the `file`.
            this.setPreferences(JSON.parse(fs.readFileSync(file)))
        } catch (error) {
            if (error instanceof SyntaxError) {
                // Syntax error, so we should give the user some context, then
                // throw the error.
                console.error('unable to load conifguration: ' + file)
                throw error
            } else if (error.code == 'ENOENT') {
                // File not found, so create one with defaults.
                this.setPreferences(require('./defaults.json'))
            }
            // Unknown error, propagate.
            throw error
        }
    }
}
```

With `rescue`, you can say the same thing, with just about as much code.

```javascript
class ConfigurableWidget extends Widget {
    configure (file) {
        try {
            // Set widget preferences with the configuration in the `file`.
            this.setPreferences(JSON.parse(fs.readFileSync(file)))
        } catch (error) {
            // If rescue cannot match the error, it will propagate.
            rescue(error, [
                // Syntax error, so we should give the user some context, then
                // throw the error.
                [ SyntaxError ], () => {
                    console.error('unable to load conifguration: ' + file)
                    throw error
                }
            ], [
                // File not found, so create one with defaults.
                [{ code: 'ENOENT' }], () => this.setPreferences(require('./defaults.json'))
            ])
        }
    }
}
```

So, what, pray tell, is wrong with me?

You see, dear user, over the years I have developed a fetish for 100% code
coverage. Let's look at these examples again through the eyes of someone who
wants to see green bars generated by Istanbul on every line of code.

```javascript
class ConfigurableWidget extends Widget {
    configure (url) {
        try {
            // Easy to test, just pass in the name of a good config file.
            this.setPreferences(JSON.parse(fs.readFileSync(file)))
        } catch (error) {
            if (SyntaxError) {
                // Easy to test, just pass in the name of a bad config file.
                console.error('unable to load conifguration: ' + file)
                throw error
            } else if (error.code == 'ENOENT') {
                // Easy to test, just pass in a missing file name.
                this.setPreferences(require('./defaults.json')
            }
            // Er, how do I hit this line of code? Monkey-patch `configure` to
            // throw an error? That's so ugly. Refactor the configuration
            // read/write to a separate class and pass in a mock that throws
            // errors? But I'd do that only for the sake of test coverage, but
            // I'd do it. You know waht? I want a default throw like all the
            // other languages.
            throw error
        }
    }
}
```

If you read the comments, you'll see that I want the default throw of the type
matching ladders in other languages. `rescue` give me this.

But wait, there's more.

I've also gotten into the habit of wrapping errors in this library I created
called `Destructible`, which I use to monitor the many async functions a
contemporary Node.js app spawns, and see that they all cancel and return when
shutdown time comes. If they don't shutdown, `Destructible` will raise an
exception. This is an exception of exceptions, since more than one can fail to
shutdown.

Additionally, `Destructible` will monitor these anonymous worker functions,
catch their exceptions and provide content in the form of a monitor name, so
that those terse stack traces whose only message is `"socket hang up"` have some
context without resorting to using `longjohn` in production.

Thus, nested exceptions, and deeply, deeply.

Rescue can search for an error in a nested heirarchy of errors and their causes.

Sometimes there is an excpetion expected, and if nothing else is in error, I can
recover from that one exception, and so I use `rescue` to pluck it out of the
heirarchy, assert that is is the sole cause, and throw the specific exception to
the caller who can deal with it.

```javascript
async function configure (configurator) {
    try {
        try {
            throw new Error('mischief')
        } catch (inner) {
            const outer = new Error('wrapper')
            outer.causes = [ inner ]
            throw outer
        }
    } catch (error) {
        // We can deal with a little mischief if that's all that's going on.
        rescue(error, [ 'mischief' ])
    }
}
```

So you see, `rescue` will go searching for a `"mischief"` error in a tree of
errors matching it if it is the only root cause. And by matching it (by the
message name this time) it will not be rethrown.

Without `rescue` I'd have to implement this search in every catch block. My unit
tests would be way too intense.

## You're Still Here?

Godness gracious, dear user, you're still here? Well, let's continue with a
definition of the one and only export from the Rescue module, `rescue`.

Imagine that `?`, `+', and `(?: )`  mean what they mean in JavaScript regular
expressions, but instead of matching characters we're matching arguments.

```text
rescue(error,(?:match:Array,(?:result|handler:Function)?)+)
```

You call rescue with the error you want to test, followed by one or more
possible matches. Each match can be prefixed with an optional options object.

```text
recscue(error,
    (?:
        [
            only:Boolean?,
            (?: depth:Integer | range:Array )?,
            errorType:Function?,
            messageOrToString:String?,
            properties:Object?,
            aribraryTest:Function*
        ],
        (?: result | handler:Function )?
    )+
)
```

In the above notation arguments in angle brackets are optional.

The basic structure of an incation of rescue is the error to rescue followed by
one or more possible matches. The matche conditions are defined in an array
along with the handler function to call if the action succeeds.

As we've seen, we can use rescue to ensure that an exception matches what we
expect.

```
try {
    config(JSON.parse(json))
} catch (error) {
    rescue(error, [ SyntaxError ])
    config(DEFAULT_JSON)
}
```

We can also use `rescue` to return a value.  The return value of `rescue` is the
return value of the match's handler.

```
try {
    return JSON.parse(json)
} catch (error) {
    return rescue(error, [ SyntaxError ], () => DEFAULT_JSON)
}
```

We can make that simpler by just specifying a value to return instead of a
handler function to call.

```javascript
try {
    return JSON.parse(json)
} catch (error) {
    return rescue(error, [ SyntaxError ], DEFAULT_JSON)
}
```

We do not need to specify an error type. We can simply specify a message we want
to match.

```javascript
try {
    f()
    return true
} catch (error) {
    return rescue(error, [ 'badness' ], false)
}
```

It's hard to trust messages to stay consistent, especially if they include
context information. You probably want to use a reguar expression to match the
bits you know to be consistent.

```javascript
try {
    return JSON.parse(json)
} catch (error) {
    return rescue(error, /JSON/, DEFAULT_JSON)
}
```

Bad example, though. For JSON it is best to match `SyntaxError`, which is what
we have been doing. Regular expressions are great for matching Node.js
`Error.code` properties as we see next.

For many Node.js errors you can match the `code` property.

```javascript
try {
    return await fs.readFile('config.txt')
} catch (error) {
    return rescue(error, [{ code: 'ENOENT' }], null)
}
```

You can also match properties by regular expression, which allows you to have
some or conditions.

```javascript
try {
    return await fs.readFile('config.txt')
} catch (error) {
    return rescue(error, [{ code: /^(?:ENOENT|EACCES)$/ }], null)
}
```

Function results can do useful work.

```javascript
try {
    return await fs.readFile(config)
} catch (error) {
    return await rescue(error, [{ code: /^(?:ENOENT|EACCES)$/ }], () => {
        return fs.readFile('./default.txt')
    })
}
```

You'll notice by now that `rescue` works with `async`/`await`.

```javascript
```
