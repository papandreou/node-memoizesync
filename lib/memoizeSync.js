(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('lru-cache'));
    } else if (typeof define === 'function' && define.amd) {
        define(['LRUCache'], factory);
    } else {
        root.memoizeSync = factory(root.LRUCache);
    }
}(this, function (LRU) {
    return function memoizeSync(lambda, options) {
        options = options || {};
        var argumentsStringifier = options.argumentsStringifier || function (args) {
                return args.map(String).join('\x1d'); // Group separator
            },
            waitingCallbacksByStringifiedArguments = {},
            lruOptions = {};

        for (var propertyName in options) {
            if (Object.prototype.hasOwnProperty.call(options, propertyName) && propertyName !== 'argumentsStringifier') {
                lruOptions[propertyName] = options[propertyName];
            }
        }
        var cache = new LRU(lruOptions);

        function memoizer() { // ...
            var that = this, // In case you want to create a memoized method
                args = Array.prototype.slice.call(arguments),
                stringifiedArguments = String(argumentsStringifier(args)), // In case the function returns a non-string
                result = cache.get(stringifiedArguments);
            if (typeof result !== 'undefined') {
                return result;
            } else {
                var returnValue = lambda.apply(that, args);
                cache.set(stringifiedArguments, returnValue);
                return returnValue;
            }
        }

        memoizer.cache = cache;
        memoizer.argumentsStringifier = argumentsStringifier;

        memoizer.peek = function () { // ...
            return cache.get(argumentsStringifier(Array.prototype.slice.call(arguments)));
        };

        memoizer.purge = function () { // ...
            cache.del(argumentsStringifier(Array.prototype.slice.call(arguments)));
        };

        memoizer.purgeAll = function () {
            cache.reset();
        };

        return memoizer;
    };
}));
