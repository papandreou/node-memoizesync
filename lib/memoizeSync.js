(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('lru-cache'));
    } else if (typeof define === 'function' && define.amd) {
        define(['LRUCache'], factory);
    } else {
        root.memoizeSync = factory(root.LRUCache);
    }
}(this, function (LRU) {
    var nextCacheKeyPrefix = 1;
    return function memoizeSync(lambda, options) {
        options = options || {};
        var argumentsStringifier = options.argumentsStringifier || function (args) {
                return args.map(String).join('\x1d'); // Group separator
            },
            cacheKeyPrefix = nextCacheKeyPrefix + '\x1d',
            waitingCallbacksByStringifiedArguments = {},
            cache;

        nextCacheKeyPrefix += 1;

        if (options.cache) {
            cache = options.cache;
        } else {
            var lruOptions = {};
            for (var propertyName in options) {
                if (Object.prototype.hasOwnProperty.call(options, propertyName) && propertyName !== 'argumentsStringifier') {
                    lruOptions[propertyName] = options[propertyName];
                }
            }
            cache = new LRU(lruOptions);
        }

        function memoizer() { // ...
            var that = this, // In case you want to create a memoized method
                args = Array.prototype.slice.call(arguments),
                stringifiedArguments = String(argumentsStringifier(args)), // In case the function returns a non-string
                result = cache.get(cacheKeyPrefix + stringifiedArguments);
            if (typeof result !== 'undefined') {
                return result;
            } else {
                var returnValue = lambda.apply(that, args);
                cache.set(cacheKeyPrefix + stringifiedArguments, returnValue);
                return returnValue;
            }
        }

        memoizer.cache = cache;
        memoizer.cacheKeyPrefix = cacheKeyPrefix;
        memoizer.argumentsStringifier = argumentsStringifier;

        memoizer.peek = function () { // ...
            return cache.get(cacheKeyPrefix + argumentsStringifier(Array.prototype.slice.call(arguments)));
        };

        memoizer.purge = function () { // ...
            cache.del(cacheKeyPrefix + argumentsStringifier(Array.prototype.slice.call(arguments)));
        };

        memoizer.purgeAll = function () {
            // Cannot use cache.forEach with cache.del in the callback, that screws up the iteration.
            var keys = cache.keys();
            for (var i = 0 ; i < keys.length ; i += 1) {
                var key = keys[i];
                if (key.indexOf(cacheKeyPrefix) === 0) {
                    cache.del(key);
                }
            }
        };

        return memoizer;
    };
}));
