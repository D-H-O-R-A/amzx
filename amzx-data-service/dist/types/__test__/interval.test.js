"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interval_1 = require("../interval");
const interval_2 = require("../../utils/interval");
describe('Interval', () => {
    const i = interval_1.interval('180s');
    describe('from method', () => {
        it('should return Result.Ok if correct args are given', () => {
            const i = interval_1.interval('10s');
            expect(i.matchWith({
                Error: () => null,
                Ok: ({ value }) => value.length,
            })).toBe(10000);
        });
        it('should return Result.Error if wrong args are given', () => {
            const i = interval_1.interval('1.5s').getOrElse(null);
            expect(i).toBe(null);
        });
    });
    describe('length', () => {
        it('should keep its length in milliseconds', () => {
            expect(i.unsafeGet().length).toBe(180000);
            expect(interval_1.interval('1h').unsafeGet().length).toBe(3600000);
        });
    });
    describe('div method', () => {
        it('should be divisible by another Interval', () => {
            const i2 = interval_1.interval('1m').unsafeGet();
            expect(interval_2.div(i.unsafeGet(), i2)).toBe(3);
        });
    });
    describe('fromMilliseconds method', () => {
        it('should return Result.Ok if correct args are given', () => {
            const i = interval_2.fromMilliseconds(900000);
            expect(i.matchWith({
                Error: () => null,
                Ok: ({ value }) => value.length,
            })).toBe(900000);
        });
        it('should return Result.Ok if correct args are given', () => {
            const i = interval_2.fromMilliseconds(3196800000);
            expect(i.matchWith({
                Error: () => null,
                Ok: ({ value }) => value.length,
            })).toBe(3196800000);
        });
        it('should return Result.Ok if correct args are given', () => {
            const i = interval_2.fromMilliseconds(1960588800000);
            expect(i.matchWith({
                Error: () => null,
                Ok: ({ value }) => value.length,
            })).toBe(1960588800000);
        });
        it('should return Result.Error if wrong args are given', () => {
            const i = interval_2.fromMilliseconds(2500).getOrElse(null);
            expect(i).toBe(null);
        });
    });
});
//# sourceMappingURL=interval.test.js.map