export default {
    clamp(boundary1, boundary2, v) {
        // returns nearest value to v no less than min, no more than max (inclusive)
        const min = Math.min(boundary1, boundary2);
        const max = Math.max(boundary1, boundary2);
        return Math.min(Math.max(min, v), max);
    },
    lerp(start, end, percentage = 0.5) {
        // travel along a line in one dimension between start and end by a normalized amount
        return start + percentage * (end - start);
    },
    inverseLerp(start, end, value) {
        // find normalized value in one dimension relative to start and end
        // this.remap(start, end, 0, 1, value);
        if (end === start) return end;
        return (value - start) / (end - start);
    },
    remap(start1, end1, start2, end2, value) {
        // same as normalizing in the start2..end2 range, a value we want to denormalize in the start1..end1 range
        // same as lerp(start2, end2, inverseLerp(start1, end1, value))
        if (end1 === start1) return end1;
        return start2 + (value - start1) / (end1 - start1) * (end2 - start2);
    },
    mLerp(start, end, percentage) {
        // travel along a line in multiple dimensions between start and end by a normalized amount
        return start.map((v, i) => this.lerp(v, end[i], percentage));
    },
    sum(values) {
        // sum numeric array
        return values.reduce((acc, v) => acc + Number(v || 0), 0);
    },
    mapBetweenEach(values, func) {
        return values.reduce((acc, value, i, arr) => {
            if (i + 1 < arr.length) acc.push(func(value, arr[i + 1], i, arr));
            return acc;
        }, []);
    },
    lerpInArray(values, value) {
        // interpolate between indicies of a discrete set as though it were continuous
        if (value <= 0) return values[0];
        if (value >= values.length - 1) return values[values.length - 1];
        const j = Math.floor(value);
        return this.lerp(values[j], values[j + 1], value - j);
    },
    lerpedYForXClosestPoints(points, inputX) {
        // returns a function from input points that can do below
        // sort by x first, then y lowest to highest
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
        return this.remap(x1, x2, y1, y2, inputX);
    },
    percentile(values, value) {
        // gets the ratio of values lower to values higher, ignoring exact matches.
        for (let i = 0, countLower = 0, countHigher = values.length; i < values.length; i++) {
            if (values[i] < value) countLower++;
            if (values[i] > value) return countLower / (countLower + countHigher);
            countHigher--;
        }
        return 1;
    },
    mapArrayIntegral(array) {
        // yeilds N+1 length array of sums below N values in array
        const res = [0];
        let lead = 0;
        array.forEach((v, i) => {
            lead += v;
            res.push(lead);
        });
        return res;
    },
    mapArrayDerivative(array) {
        // yeilds N-1 length array of change between N values in array
        return this.mapBetweenEach(array, (a, b) => b - a);
    },
    makeDistribution(array, buckets, min = Math.min(...array), max = Math.max(...array)) {
        // yeilds array of integers containing a count of normalized values in an array distributed across N buckets
        const res = Array.from(new Array(buckets), () => 0);
        array.forEach((v) => {
            // the most important decision is to floor, round, or ceil here.
            res[Math.floor(this.clamp(0, buckets - 1, this.remap(min, max, 0, buckets, v)))] += 1;
        });
        return res;
    },
    linearIntegral({ x: x1, y: y1 }, { x: x2, y: y2 }) {
        // get area under a line segment by taking the absolute difference of x1 and x2 times the midpoint of y1 and y2
        return Math.abs(x2 - x1) * (y1 + y2) / 2;
    },
    // Don't test until `makeProportional` is used
    amplify(values, coeficient) {
        // multiply each value in an array by a scalar
        return values.map(v => v * coeficient);
    },
    normalizeArray(values) {
        // adjust a numeric array such that all values are 0..1
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        return values.map(v => this.inverseLerp(minValue, maxValue, v));
    },
    makeProportional(values) {
        // adjust a numeric array such that the sum of its values are 1
        const sumValues = this.sum(values);
        if (sumValues === 0) return values;
        return this.amplify(values, 1 / sumValues);
    },
};