module.exports = function memoizeSync(lambda, options) {
    options = options || {};
    var argumentsStringifier = options.argumentsStringifier || function (args) {
            return args.map(String).join('\x1d'); // Group separator
        },
        ttl = options.ttl,
        waitingCallbacksByStringifiedArguments = {},
        returnValueByStringifiedArguments = {},
        expiryTimestampByStringifiedArguments = {};

    function memoizer() { // ...
        var that = this, // In case you want to create a memoized method
            args = Array.prototype.slice.call(arguments),
            stringifiedArguments = String(argumentsStringifier(args)); // In case the function returns a non-string
        if (stringifiedArguments in returnValueByStringifiedArguments && (typeof ttl === 'undefined' || expiryTimestampByStringifiedArguments[stringifiedArguments] >= Date.now())) {
            return returnValueByStringifiedArguments[stringifiedArguments];
        } else {
            var returnValue = lambda.apply(that, args);
            returnValueByStringifiedArguments[stringifiedArguments] = returnValue;
            if (typeof ttl !== 'undefined') {
                expiryTimestampByStringifiedArguments[stringifiedArguments] = Date.now() + ttl;
            }
            return returnValue;
        }
    }

    memoizer.purge = function () { // ...
        var stringifiedArguments = argumentsStringifier(Array.prototype.slice.call(arguments));
        delete returnValueByStringifiedArguments[stringifiedArguments];
        delete expiryTimestampByStringifiedArguments[stringifiedArguments];
    };

    memoizer.purgeAll = function () {
        returnValueByStringifiedArguments = {};
        expiryTimestampByStringifiedArguments = {};
    };

    return memoizer;
};
