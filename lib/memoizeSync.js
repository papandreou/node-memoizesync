module.exports = function memoizeSync(lambda, argumentsStringifier) {
    argumentsStringifier = argumentsStringifier || function (args) {
        return args.map(String).join('\x1d'); // Group separator
    };
    var waitingCallbacksByStringifiedArguments = {},
        returnValueByStringifiedArguments = {};

    function memoizer() { // ...
        var that = this, // In case you want to create a memoized method
            args = Array.prototype.slice.call(arguments),
            stringifiedArguments = String(argumentsStringifier(args)); // In case the function returns a non-string
        if (stringifiedArguments in returnValueByStringifiedArguments) {
            return returnValueByStringifiedArguments[stringifiedArguments];
        } else {
            var returnValue = lambda.apply(that, args);
            returnValueByStringifiedArguments[stringifiedArguments] = returnValue;
            return returnValue;
        }
    }

    memoizer.purge = function () { // ...
        delete returnValueByStringifiedArguments[argumentsStringifier(Array.prototype.slice.call(arguments))];
    };

    memoizer.purgeAll = function () {
        returnValueByStringifiedArguments = {};
    };

    return memoizer;
};
