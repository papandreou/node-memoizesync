var memoizeSync = require('../lib/memoizeSync'),
    expect = require('expect.js');

describe('memoizeSync', function () {
    it('on a zero-param function should keep returning the same result', function () {
        var nextNumber = 1,
            memoizedGetNextNumber = memoizeSync(function getNextNumber() {
                return nextNumber++;
            });

        expect(memoizedGetNextNumber()).to.equal(1);
        expect(memoizedGetNextNumber()).to.equal(1);
    });

    it('on a multi-param function should only return the same result when the parameters are the same', function () {
        var nextNumber = 1,
            memoizedSumOfOperandsPlusNextNumber = memoizeSync(function sumOfOperandsPlusNextNumber(op1, op2) {
                return op1 + op2 + nextNumber++;
            });

        expect(memoizedSumOfOperandsPlusNextNumber(10, 10)).to.equal(21);
        expect(memoizedSumOfOperandsPlusNextNumber(10, 10)).to.equal(21);
        expect(memoizedSumOfOperandsPlusNextNumber(10, 20)).to.equal(32);
        memoizedSumOfOperandsPlusNextNumber.purge(10, 20);
        expect(memoizedSumOfOperandsPlusNextNumber(10, 20)).to.equal(33);
        expect(memoizedSumOfOperandsPlusNextNumber(10, 10)).to.equal(21);
        memoizedSumOfOperandsPlusNextNumber.purgeAll();
        expect(memoizedSumOfOperandsPlusNextNumber(10, 20)).to.equal(34);
        expect(memoizedSumOfOperandsPlusNextNumber(10, 10)).to.equal(25);
    });

    it('should produce a function that works as a method', function () {
        function Counter() {
            this.nextNumber = 1;
        }

        Counter.prototype.getNextNumber = memoizeSync(function () {
            return this.nextNumber++;
        });

        var counter = new Counter();

        expect(counter.getNextNumber()).to.equal(1);
        expect(counter.nextNumber).to.equal(2);
        expect(counter.getNextNumber()).to.equal(1);
        counter.getNextNumber.purge();
        expect(counter.getNextNumber()).to.equal(2);
        expect(counter.nextNumber).to.equal(3);
    });

    it('should work with a custom argumentsStringifier', function () {
        function toCanonicalJson(obj) {
            return JSON.stringify(function traverseAndSortKeys(obj) {
                if (Array.isArray(obj)) {
                    return obj.map(traverseAndSortKeys);
                } else if (typeof obj === 'object' && obj !== null) {
                    var resultObj = {};
                    Object.keys(obj).sort().forEach(function (key) {
                        resultObj[key] = traverseAndSortKeys(obj[key]);
                    });
                    return resultObj;
                } else {
                    return obj;
                }
            }(obj));
        }

        var nextNumber = 1,
            memoizedGetNextNumber = memoizeSync(function getNextNumber(obj, cb) {
                return nextNumber++;
            }, {
                argumentsStringifier: function (args) {
                    return args.map(toCanonicalJson).join('\x1d');
                }
            });

        expect(memoizedGetNextNumber({foo: 'bar', quux: 'baz'})).to.equal(1);
        expect(memoizedGetNextNumber({quux: 'baz', foo: 'bar'})).to.equal(1);
        expect(memoizedGetNextNumber({barf: 'baz'})).to.equal(2);
    });

    it('with a ttl should recompute the value after the ttl has expired', function (done) {
        var nextNumber = 1,
            memoizedGetNextNumber = memoizeSync(function getNextNumber(cb) {
                return nextNumber++;
            }, {ttl: 10});

        expect(memoizedGetNextNumber()).to.equal(1);
        expect(memoizedGetNextNumber()).to.equal(1);
        setTimeout(function () {
            expect(memoizedGetNextNumber()).to.equal(2);
            done();
        }, 15);
    });
});
