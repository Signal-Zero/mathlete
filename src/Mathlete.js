/* Mathlete math library - Helper functions for common math operations */

function lerp(start, end, percentage = 0.5) {
    // travel along a line in one dimension between start and end by a normalized amount
    return start + percentage * (end - start);
}

function clamp(boundary1, boundary2, v) {
    // returns nearest value to v no less than min, no more than max (inclusive)
    const min = Math.min(boundary1, boundary2);
    const max = Math.max(boundary1, boundary2);
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

function sum(values) {
    // sum numeric array
    return values.reduce((acc, v) => acc + Number(v || 0), 0);
}

function average(numbers) {
    return Math.round(numbers.reduce((acc, num) =>
        acc + num, 0) / numbers.length);
}

function mapBetweenEach(values, func) {
    return values.reduce((acc, value, i, arr) => {
        if (i + 1 < arr.length) acc.push(func(value, arr[i + 1], i, arr));
        return acc;
    }, []);
}

function lerpInArray(values, value) {
    if (!Array.isArray(values) || values.length === 0) {
        throw new TypeError("Values must be a non-empty array");
    }
    // interpolate between indicies of a discrete set as though it were continuous
    if (value <= 0) return values[0];
    if (value >= values.length - 1) return values[values.length - 1];
    const j = Math.floor(value);
    return lerp(values[j], values[j + 1], value - j);
}

function percentile(values, value) {
    // gets the ratio of values lower to values higher, ignoring exact matches.
    for (let i = 0, countLower = 0, countHigher = values.length; i < values.length; i++) {
        if (values[i] < value) countLower++;
        if (values[i] > value) return countLower / (countLower + countHigher);
        countHigher--;
    }
    return 1;
}

function mapArrayIntegral(array) {
    // yields N+1 length array of sums below N values in array
    const res = [0];
    let lead = 0;
    array.forEach((v) => {
        lead += v;
        res.push(lead);
    });
    return res;
}

function mapArrayDerivative(array) {
    // yields N-1 length array of change between N values in array
    return mapBetweenEach(array, (a, b) => b - a);
}

function makeDistribution(values, bucketCount, min = Math.min(...values), max = Math.max(...values)) {
    // yields array of integers containing a count of normalized values in an array distributed across N buckets
    if (bucketCount < 1 || bucketCount % 1 !== 0) throw new RangeError("bucketCount must be a positive integer");
    const res = new Array(bucketCount).fill(0);
    values.forEach((v) => {
        // the most important decision is to floor, round, or ceil here.
        res[Math.floor(
            clamp(
                0,
                bucketCount - 1,
                remap(
                    min,
                    max,
                    0,
                    bucketCount,
                    v,
                ),
            ),
        )] += 1;
    });
    return res;
}

// Don't test until `makeProportional` is used
function amplify(values, coefficient) {
    // multiply each value in an array by a scalar
    return values.map(v => v * coefficient);
}

function normalizeArray(values) {
    // adjust a numeric array such that all values are 0..1
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    return values.map(v => inverseLerp(minValue, maxValue, v));
}

function makeProportional(values) {
    // adjust a numeric array such that the sum of its values are 1
    const sumValues = sum(values);
    if (sumValues === 0) return values;
    return amplify(values, 1 / sumValues);
}

function decimalToPercent(value) {
    return value * 100;
}

function linearIntegral({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    // get area under a line segment by taking the absolute difference of x1 and x2 times the midpoint of y1 and y2
    return Math.abs(x2 - x1) * (y1 + y2) / 2;
}

function lerpBetweenPoints({ x: x1, y: y1 }, { x: x2, y: y2 }, percentage) {
    // travel along a line in multiple dimensions between start and end by a normalized amount
    return {
        x: lerp(x1, x2, percentage),
        y: lerp(y1, y2, percentage),
    };
}

function midpoint(point1, point2) { // could easily become part of Mathlete
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

    const sortedPoints = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
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
    const i = points.findIndex(({ x }) => x >= inputX);
    const { x: x1, y: y1 } = sortedPoints[i - 1];
    const { x: x2, y: y2 } = sortedPoints[i];
    // then get a new value relative to y1..y2 as percentile was to x1..x2
    return remap(x1, x2, y1, y2, inputX);
}

function sumIntegralsBetweenPoints(points) {
    return sum(mapBetweenEach(points, linearIntegral));
}

export default {
    lerp,
    clamp,
    inverseLerp,
    remap,
    sum,
    average,
    mapBetweenEach,
    lerpInArray,
    percentile,
    mapArrayIntegral,
    mapArrayDerivative,
    makeDistribution,
    amplify,
    normalizeArray,
    makeProportional,
    decimalToPercent,
    Point: {
        lerpedYBetweenPoints,
        linearIntegral,
        midpoint,
        lerpBetweenPoints,
        sumIntegralsBetweenPoints,
    },
};
