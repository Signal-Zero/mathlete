"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
 * Mathlete math library
 * Helper functions for common math operations
 *
 */

/** travel along a line in one dimension between start and end by a normalized amount */
function lerp(start, end) {
    var percentage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

    return start + percentage * (end - start);
}

/** returns nearest value to v no less than min, no more than max (inclusive) */
function clamp(boundary1, boundary2, v) {
    var min = Math.min(boundary1, boundary2);
    var max = Math.max(boundary1, boundary2);
    return Math.min(Math.max(min, v), max);
}

function inverseLerp(start, end, value) {
    // find normalized value in one dimension relative to start and end
    // remap(start, end, 0, 1, value);
    if (start === end) return 0;
    return (value - start) / (end - start);
}

function remap(start1, end1, start2, end2, value) {
    // same as normalizing in the start2..end2 range, a value we want to denormalize in the start1..end1 range
    // same as lerp(start2, end2, inverseLerp(start1, end1, value))
    if (start1 === end1) return 0;
    return start2 + (value - start1) / (end1 - start1) * (end2 - start2);
}

/** sum numeric array */
function sum(values) {
    return values.reduce(function (acc, v) {
        return acc + Number(v || 0);
    }, 0);
}

function average(numbers) {
    if (numbers.length === 0) {
        throw new RangeError("numbers should be a non-empty array");
    }

    return Math.round(numbers.reduce(function (acc, num) {
        return acc + num;
    }, 0) / numbers.length);
}

/** not exactly math – more like a helper function */
function mapBetweenEach(values, func) {
    return values.reduce(function (acc, value, i, arr) {
        if (i + 1 < arr.length) acc.push(func(value, arr[i + 1], i, arr));
        return acc;
    }, []);
}

/** interpolate between indicies of a discrete set as though it were continuous */
function lerpInArray(values, value) {
    if (!Array.isArray(values) || values.length === 0) {
        throw new TypeError("Values must be a non-empty array");
    }

    if (value <= 0) return values[0];
    if (value >= values.length - 1) return values[values.length - 1];
    var j = Math.floor(value);
    return lerp(values[j], values[j + 1], value - j);
}

/** gets the ratio of values lower to values higher, ignoring exact matches. */
function percentile(values, value) {
    for (var i = 0, countLower = 0, countHigher = values.length; i < values.length; i++) {
        if (values[i] < value) countLower++;
        if (values[i] > value) return countLower / (countLower + countHigher);
        countHigher--;
    }
    return 1;
}

/** yields N+1 length array of sums below N values in array */
function mapArrayIntegral(array) {
    var res = [0];
    var lead = 0;
    array.forEach(function (v) {
        lead += v;
        res.push(lead);
    });
    return res;
}

/** yields N-1 length array of change between N values in array */
function mapArrayDerivative(array) {
    return mapBetweenEach(array, function (a, b) {
        return b - a;
    });
}

/** yields array of integers containing a count of normalized values in an array distributed across N buckets */
function makeDistribution(values, bucketCount) {
    var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Math.min.apply(Math, _toConsumableArray(values));
    var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Math.max.apply(Math, _toConsumableArray(values));

    if (bucketCount < 1 || bucketCount % 1 !== 0) throw new RangeError("bucketCount must be a positive integer");
    var res = new Array(bucketCount).fill(0);
    values.forEach(function (v) {
        // the most important decision is to floor, round, or ceil here.
        res[Math.floor(clamp(0, bucketCount - 1, remap(min, max, 0, bucketCount, v)))] += 1;
    });
    return res;
}

/** multiply each value in an array by a scalar */
function amplify(values, coefficient) {
    return values.map(function (v) {
        return v * coefficient;
    });
}

/** adjust a numeric array such that all values are 0..1 */
function normalizeArray(values) {
    if (values.length === 1) {
        return [1];
    }

    var minValue = Math.min.apply(Math, _toConsumableArray(values));
    var maxValue = Math.max.apply(Math, _toConsumableArray(values));

    return values.map(function (v) {
        return inverseLerp(minValue, maxValue, v);
    });
}

/** adjust a numeric array such that the sum of its values are 1 */
function makeProportional(values) {
    var sumValues = sum(values);
    if (sumValues === 0) return values;
    return amplify(values, 1 / sumValues);
}

function decimalToPercent(value) {
    return value * 100;
}

/** get area under a line segment by taking the absolute difference of x1 and x2 times the midpoint of y1 and y2 */
function linearIntegral(_ref, _ref2) {
    var x1 = _ref.x,
        y1 = _ref.y;
    var x2 = _ref2.x,
        y2 = _ref2.y;

    return Math.abs(x2 - x1) * (y1 + y2) / 2;
}

/** travel along a line in multiple dimensions between start and end by a normalized amount */
function lerpBetweenPoints(_ref3, _ref4, percentage) {
    var x1 = _ref3.x,
        y1 = _ref3.y;
    var x2 = _ref4.x,
        y2 = _ref4.y;

    return {
        x: lerp(x1, x2, percentage),
        y: lerp(y1, y2, percentage)
    };
}

function midpoint(point1, point2) {
    // could easily become part of Mathlete
    return lerpBetweenPoints(point1, point2, 0.5);
}

function lerpedYBetweenPoints(points, inputX) {
    // @TODO: split this into getSurroundingPair()
    // returns a function from input points that can do below
    // sort by x first, then y lowest to highest
    if (!points.length) {
        // Cannot find lerpedY between non existent points
        // TODO: should eventually throw an error
        return undefined;
    }

    var sortedPoints = points.slice().sort(function (a, b) {
        return a.x - b.x || a.y - b.y;
    });
    // takes an array of points [{ x, y }...] sorted by x value...
    // ...and a given x value to search for...
    // ...and returns a lerped y value between the points around that x
    // if less than first x, use first y
    if (inputX <= sortedPoints[0].x) {
        return sortedPoints[0].y;
    }
    // if more than last x, use last y
    if (inputX >= sortedPoints[sortedPoints.length - 1].x) {
        return sortedPoints[sortedPoints.length - 1].y;
    }

    // otherwise find the first point with a greater or equivalent x value
    var i = points.findIndex(function (_ref5) {
        var x = _ref5.x;
        return x >= inputX;
    });
    var _sortedPoints = sortedPoints[i - 1],
        x1 = _sortedPoints.x,
        y1 = _sortedPoints.y;
    var _sortedPoints$i = sortedPoints[i],
        x2 = _sortedPoints$i.x,
        y2 = _sortedPoints$i.y;
    // then get a new value relative to y1..y2 as percentile was to x1..x2

    return remap(x1, x2, y1, y2, inputX);
}

function sumIntegralsBetweenPoints(points) {
    return sum(mapBetweenEach(points, linearIntegral));
}

exports.default = {
    lerp: lerp,
    clamp: clamp,
    inverseLerp: inverseLerp,
    remap: remap,
    sum: sum,
    average: average,
    mapBetweenEach: mapBetweenEach,
    lerpInArray: lerpInArray,
    percentile: percentile,
    mapArrayIntegral: mapArrayIntegral,
    mapArrayDerivative: mapArrayDerivative,
    makeDistribution: makeDistribution,
    amplify: amplify,
    normalizeArray: normalizeArray,
    makeProportional: makeProportional,
    decimalToPercent: decimalToPercent,
    Point: {
        lerpedYBetweenPoints: lerpedYBetweenPoints,
        linearIntegral: linearIntegral,
        midpoint: midpoint,
        lerpBetweenPoints: lerpBetweenPoints,
        sumIntegralsBetweenPoints: sumIntegralsBetweenPoints
    }
};