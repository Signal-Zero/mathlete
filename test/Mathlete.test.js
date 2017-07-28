import chai from "chai";
import Mathlete from "../src/Mathlete";

chai.should();

describe("Mathlete - math helper functions", () => {
    describe("clamp", () => {
        it("Clamps a number between a min and max value", () => {
            Mathlete.clamp(0, 1, 2).should.equal(1);
            Mathlete.clamp(0, 1, 0.5).should.equal(0.5);
            Mathlete.clamp(0, 1, -1).should.equal(0);
            // edge cases
            Mathlete.clamp(0, 1, 0).should.equal(0);
            Mathlete.clamp(0, 1, 1).should.equal(1);
            Mathlete.clamp(1, 0, 2).should.equal(1);
            Mathlete.clamp(1, 0, -1).should.equal(0);

            Mathlete.clamp(1, 1, 1000).should.equal(1);
            Mathlete.clamp(0, 0, 2000).should.equal(0);

            // random tests
            // for 10 random numbers between 0 and 1, expect clamp to do nothing
            Array.from(new Array(10), () => Math.random()).forEach((v) => {
                Mathlete.clamp(0, 1, v).should.equal(v);
            });
            // for 10 random ranges
            Array.from(new Array(10), () => Math.random()).forEach((v) => {
                const [min, max] = [Math.random(), Math.random()].sort((a, b) => a - b);
                const res = Mathlete.clamp(min, max, v);
                res.should.not.be.above(max).and.not.be.below(min);
            });
        });
    });

    describe("lerp", () => {
        it("Linearly interpolates (lerps) between two values", () => {
            Mathlete.lerp(0, 1, 0.5).should.equal(0.5);
            Mathlete.lerp(0, 10, 0.25).should.equal(2.5);
            Mathlete.lerp(10, 0, 0.25).should.equal(7.5);
            Mathlete.lerp(1, 3, 0.25).should.equal(1.5);

            // edge cases
            Mathlete.lerp(0, 0, 0.5).should.equal(0);

            // random tests
            // for 10 random numbers between 0 and 1, expect lerp to do nothing
            Array.from(new Array(10), () => Math.random() * Number.MAX_SAFE_INTEGER).forEach((v) => {
                Mathlete.lerp(0, 1, v).should.equal(v);
            });
        });
    });

    describe("inverseLerp", () => {
        it("Inverts linear interpolation between two values", () => {
            Mathlete.inverseLerp(0, 1, 0.5).should.equal(0.5);
            Mathlete.inverseLerp(0, 10, 2.5).should.equal(0.25);
            Mathlete.inverseLerp(10, 0, 7.5).should.equal(0.25);
            Mathlete.inverseLerp(1, 3, 1.5).should.equal(0.25);

            // edge cases
            Mathlete.inverseLerp(0, 0, 0.5).should.equal(0);

            // random tests
            // for 10 random numbers between 0 and 1, expect lerp to do nothing
            Array.from(new Array(10), () => Math.random() * Number.MAX_SAFE_INTEGER).forEach((v) => {
                Mathlete.inverseLerp(0, 1, v).should.equal(v);
            });
        });
    });

    describe("remap", () => {
        it("moves value from one range into another (inverseLerp)", () => {
            Mathlete.remap(0, 1, 1, 2, 0.5).should.equal(1.5);
            Mathlete.remap(0, 1, -1, 0, 0.5).should.equal(-0.5, "handle negative ranges");
            Mathlete.remap(0, 1, 0, 2, 0).should.equal(0);
            Mathlete.remap(0, 1, 2, 0, 0).should.equal(2, "handle inverted ranges");
            Mathlete.remap(0, 1, 0, 2, 1).should.equal(2);
            Mathlete.remap(0, 1, 0, 2, 3).should.equal(6);
            Mathlete.remap(-1, 0, 0, 2, 0.5).should.equal(3);
            Mathlete.remap(0, -1, 0, 2, 0.5).should.equal(-1);

            // edge cases
            Mathlete.remap(0, 0, 0, 1, 3).should.equal(0, "handle division by zero");
        });
    });

    describe("linearIntegral", () => {
        it("Integrates line segments between two points", () => {
            const tolerance = 10 ** -12; // good enough for most cases (12 decimal places)

            Mathlete.linearIntegral({ x: 0, y: 0 }, { x: 1, y: 1 }).should.equal(0.5, "handles common case");
            Mathlete.linearIntegral({ x: 0, y: 1 }, { x: 1, y: 1 }).should.equal(1, "handles no change in y");
            Mathlete.linearIntegral({ x: 0, y: 0 }, { x: -1, y: 1 }).should.equal(0.5, "handles reversed x values");
            Mathlete.linearIntegral({ x: 0, y: 0 }, { x: 1, y: -1 }).should.equal(-0.5, "handles reversed y values");
            Mathlete.linearIntegral({ x: 0, y: 0 }, { x: -1, y: -1 }).should.equal(-0.5, "handles both axes reversed");
            Mathlete.linearIntegral({ x: 1, y: 1 }, { x: 2, y: 2 }).should.equal(1.5, "handles non-zero starting x");
            Mathlete.linearIntegral({ x: 0, y: 1 }, { x: 1, y: 2 }).should.equal(1.5, "handles non-zero starting y");

            // Edge Cases
            Mathlete.linearIntegral({ x: 1, y: 1 }, { x: 1, y: 2 }).should.equal(0, "no change in x");
            Mathlete.linearIntegral({ x: 0, y: 0 }, { x: 0, y: 0 }).should.equal(0, "no change in anything");

            // Random Tests
            Array.from(new Array(10), () => null).forEach(() => {
                const run = 100 - (Math.random() * 200);
                const rise = 100 - (Math.random() * 200);
                Mathlete.linearIntegral({ x: 0, y: rise }, { x: run, y: rise }).should.equal(Math.abs(run) * rise, "handles rectangles without precision loss");
            });
            Array.from(new Array(10), () => null).forEach(() => {
                const initialX = 50 - (Math.random() * 100);
                const run = 100 - (Math.random() * 200);
                const rise = 100 - (Math.random() * 200);
                Mathlete.linearIntegral({ x: initialX, y: 0 }, { x: initialX + run, y: rise }).should.be.closeTo((Math.abs(run) * rise) / 2, tolerance, "handles right triangles within tolerance");
            });
            Array.from(new Array(10), () => null).forEach(() => {
                const initialX = 50 - (Math.random() * 100);
                const run = 100 - (Math.random() * 200);
                const rise = 100 - (Math.random() * 200);
                Mathlete.linearIntegral({ x: initialX, y: rise }, { x: initialX + run, y: -rise }).should.equal(0, "handles y median of 0 without precision loss");
            });

            // Undefined args
            [
                [{ y: 0 }, { x: 0, y: 0 }],
                [{ x: 0 }, { x: 0, y: 0 }],
                [{ x: 0, y: 0 }, { y: 0 }],
                [{ x: 0, y: 0 }, { x: 0 }],
            ].forEach((pair) => {
                // TODO: throw TypeError or set defaults
                Mathlete.linearIntegral(...pair).should.be.NaN;
            });
        });
    });

    describe("mapBetweenEach", () => {
        it("Can run a function between each value in array and return a map", () => {
            Mathlete.mapBetweenEach(
                [],
                () => true,
            ).should.be.an("array").with.lengthOf(0).that.deep.equals(
                [],
                "return empty array if input empty",
            );

            Mathlete.mapBetweenEach(
                [true],
                () => true,
            ).should.be.an("array").with.lengthOf(0).that.deep.equals(
                [],
                "return empty array if input singular",
            );

            Mathlete.mapBetweenEach(
                Array.from(new Array(10)),
                () => true,
            ).should.be.an("array").with.lengthOf(9).that.deep.equals(
                Array.from(new Array(9), () => true),
                "return array regardless of contents",
            );

            const randomLength = Math.ceil(1 + (Math.random() * 100));
            Mathlete.mapBetweenEach(
                Array.from(new Array(randomLength)),
                () => undefined,
            ).should.be.an("array").with.lengthOf(randomLength - 1);

            Mathlete.mapBetweenEach(
                [true, false],
                (a, b) => a && b,
            ).should.be.an("array").with.lengthOf(1).that.deep.equals(
                [false],
                "simple boolean pair",
            );

            const pairOfRandoms = [Math.random(), Math.random()];
            Mathlete.mapBetweenEach(
                pairOfRandoms, (a, b) => Math.max(a, b),
            ).should.be.an("array").with.lengthOf(1).that.deep.equals(
                [Math.max(...pairOfRandoms)],
                "higher of pair",
            );

            Mathlete.mapBetweenEach(
                Array.from(new Array(10), (v, i) => i),
                (a, b) => b - a,
            ).should.be.an("array").with.lengthOf(9).that.deep.equals(
                Array.from(new Array(9), () => 1),
                "first derivative, linear growth",
            );

            Mathlete.mapBetweenEach(
                Array.from(new Array(10), (v, i) => i),
                (a, b, i) => Mathlete.linearIntegral({ x: i, y: a }, { x: i + 1, y: b }),
            ).should.be.an("array").with.lengthOf(9).that.deep.equals(
                Array.from(new Array(9), (v, i) => i + 0.5),
                "linear integrals, linear growth",
            );
        });
    });

    // TODO: finish the test if the lerpInArray function
    // is used anywhere
    describe("lerpInArray", () => {
        it("interpolates value between two indices if requested index is fractional", () => {
            Mathlete.lerpInArray([0, 1, 2, 3], 1.25).should.equal(1.25);

            // random tests
            // for an array which is a map of its own indexes...
            // ...expect any requested index to return itself
            Array.from(new Array(Math.ceil(Math.random() * 100)), (v, i) => i)
                .forEach((v, i, arr) => {
                    const testIndex = Math.floor(Math.random() * arr.length);
                    Mathlete.lerpInArray(arr, testIndex).should.equal(testIndex);
                });

            // for an array of two keys and a value 0..1, lerp in range
            Array.from(new Array(10), () => Math.random())
                .forEach((v) => {
                    Mathlete.lerpInArray([4, 8], v).should.equal(Mathlete.lerp(4, 8, v));
                });

            // for an array of two keys and a value 0..1, lerp in range
            Array.from(new Array(10), () => Math.random() + 1)
                .forEach((v) => {
                    Mathlete.lerpInArray([4, 8, 16], v).should.equal(Mathlete.lerp(8, 16, v % 1));
                });
        });

        it("clamps an input value to the range of indices and returns the corresponding value", () => {
            Mathlete.lerpInArray([0, 1, 2, 3], -1).should.equal(0);
            Mathlete.lerpInArray([0, 1, 2, 3], 4).should.equal(3);
        });
    });

    describe("lerpedYForXClosestPoints", () => {
        it("returns a Y value lerped between the two nearest x points", () => {
            /*
            x values less than lowest x value return y for lowest x
            x values higher than highest x value return y for highest x
            x values equal to x value return y value for first! matching x
            x values between two points return y value lerped between first match

             */
            Mathlete.lerpedYForXClosestPoints([
                { x: 0, y: 1 },
                { x: 30, y: 2 },
                { x: 50, y: 5 },
                { x: 80, y: 7 },
                { x: 99, y: 9.9 },
            ], 50).should.equal(5);

            Mathlete.lerpedYForXClosestPoints([
                { x: 10, y: 1 },
                { x: 30, y: 2 },
                { x: 50, y: 5 },
                { x: 80, y: 7 },
                { x: 99, y: 9.9 },
            ], 0).should.equal(1);

            Mathlete.lerpedYForXClosestPoints([
                { x: 10, y: 1 },
                { x: 30, y: 2 },
                { x: 50, y: 5 },
                { x: 80, y: 7 },
                { x: 99, y: 9.9 },
            ], 100).should.equal(9.9);

            Mathlete.lerpedYForXClosestPoints([
                { x: 10, y: 1 },
                { x: 30, y: 5 },
                { x: 30, y: 2 },
                { x: 80, y: 7 },
                { x: 99, y: 9.9 },
            ], 30).should.equal(2);

            Mathlete.lerpedYForXClosestPoints([
                { x: 0, y: 1 },
                { x: 30, y: 2 },
                { x: 50, y: 5 },
                { x: 80, y: 7 },
                { x: 99, y: 9.9 },
            ], 90).should.equal(8.526315789473685);
        });
    });

    describe("sum", () => {
        it("sums all the values in the given array", () => {
            Mathlete.sum([1, 2, 2, 1]).should.equal(6);
            Mathlete.sum([10, 10, 2, 2, -1]).should.equal(23);
            Mathlete.sum([0]).should.equal(0);
            Mathlete.sum([]).should.equal(0);
            Mathlete.sum(["", 2, 3]).should.equal(5);
        });
    });
});
