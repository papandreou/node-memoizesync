node-memoizesync
================

Yet another memoizer for synchronous functions.

```javascript
var memoizeSync = require('memoizesync');

function myExpensiveComputation(arg1, arg2) {
    // ...
    return result;
}

var memoized = memoizeSync(myExpensiveComputation);
```

Now `memoized` works exactly like `myExpensiveComputation`, except that
the actual computation is only performed once for each unique set of
arguments:

```javascript
var result = memoized(42, 100);
// Got the result!

var result2 = memoized(42, 100);
// Got the same result, and much faster this time!
```

The function returned by `memoizeSync` invokes the wrapped function
in the context it's called in itself, so `memoizeSync` even works for
memoizing a method that has access to instance variables:

```javascript
function Foo(name) {
    this.name = name;
}

Foo.prototype.myMethod = memoizeSync(function (arg1, arg2) {
    console.warn("Cool, this.name works here!", this.name);
    // ...
    return "That was tough, but I'm done now!";
});
```

To distinguish different invocations (whose results need to be cached
separately) `memoizeSync` relies on a naive stringification of the
arguments, which is looked up in an internally kept hash. If the
function you're memoizing takes non-primitive arguments you might want
to provide a custom `argumentsStringifier` as the second argument to
`memoizeSync`. Otherwise all object arguments will be considered equal
because they stringify to `[object Object]`:

```javascript
var memoized = memoizeSync(function functionToMemoize(obj) {
    // ...
    return Object.keys(obj).join('');
}, function argumentStringifier(args) {
   return args.map(function (arg) {return JSON.stringify(arg);}).join(",");
});

memoized({foo: 'bar'}); // 'foo'

memoized({quux: 'baz'}); // 'quux'
```

Had the custom `argumentsStringifier` not been provided, the memoized
function would would have returned `foo` both times.

Check out <a
href="https://github.com/papandreou/node-memoizesync/blob/master/test/memoizeSync.js">the
custom argumentsStringifier test</a> for another example.


Installation
------------

Make sure you have node.js and npm installed, then run:

    npm install memoizesync

License
-------

3-clause BSD license -- see the `LICENSE` file for details.
