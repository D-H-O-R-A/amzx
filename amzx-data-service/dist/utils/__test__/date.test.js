"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_1 = require("../date");
const types_1 = require("../../types");
describe('date helper functions', () => {
    describe('arithmetic functions', () => {
        const d = new Date('2018-11-22T17:55:46.045Z');
        it('add interval to date', () => {
            expect(date_1.add(types_1.interval('3m').unsafeGet(), d)).toEqual(new Date('2018-11-22T17:58:46.045Z'));
            expect(date_1.add(types_1.interval('3h').unsafeGet(), d)).toEqual(new Date('2018-11-22T20:55:46.045Z'));
        });
        it('subtract interval from date', () => {
            expect(date_1.subtract(types_1.interval('3m').unsafeGet(), d)).toEqual(new Date('2018-11-22T17:52:46.045Z'));
            expect(date_1.subtract(types_1.interval('3h').unsafeGet(), d)).toEqual(new Date('2018-11-22T14:55:46.045Z'));
        });
    });
    describe('round functions', () => {
        describe('should round down to a minute', () => {
            const i = types_1.interval('1m').unsafeGet();
            const d = new Date('2018-11-22T17:55:46.045Z');
            it('with floor/ceil', () => {
                expect(date_1.ceil(i, d)).toEqual(new Date('2018-11-22T17:56:00.000Z'));
                expect(date_1.floor(i, d)).toEqual(new Date('2018-11-22T17:55:00.000Z'));
            });
            it('with round, up', () => {
                expect(date_1.round(i, d)).toEqual(new Date('2018-11-22T17:56:00.000Z'));
            });
            it('with round, down', () => {
                const d2 = new Date('2018-11-22T17:55:26.045Z');
                expect(date_1.round(i, d2)).toEqual(new Date('2018-11-22T17:55:00.000Z'));
            });
        });
        describe('should round down to a hour', () => {
            const i = types_1.interval('1h').unsafeGet();
            const d = new Date('2018-11-22T23:55:46.045+00:00');
            it('with floor/ceil', () => {
                expect(date_1.ceil(i, d)).toEqual(new Date('2018-11-23T00:00:00.000+00:00'));
                expect(date_1.floor(i, d)).toEqual(new Date('2018-11-22T23:00:00.000+00:00'));
            });
            it('with round, up', () => {
                expect(date_1.round(i, d)).toEqual(new Date('2018-11-23T00:00:00.000+00:00'));
            });
            it('with round, down', () => {
                const d2 = new Date('2018-11-22T23:25:46.045Z');
                expect(date_1.round(i, d2)).toEqual(new Date('2018-11-22T23:00:00.000+00:00'));
            });
        });
        describe('should round down to a week', () => {
            const i = types_1.interval('1w').unsafeGet();
            const d = new Date('2018-11-20T23:55:46.045+00:00');
            it('with floor/ceil', () => {
                expect(date_1.ceil(i, d)).toEqual(new Date('2018-11-26T00:00:00.000Z'));
                expect(date_1.floor(i, d)).toEqual(new Date('2018-11-19T00:00:00.000Z'));
            });
            it('with round, down', () => {
                expect(date_1.round(i, d)).toEqual(new Date('2018-11-19T00:00:00.000Z'));
            });
            it('with round, up', () => {
                const d2 = new Date('2018-11-22T23:25:46.045Z');
                expect(date_1.round(i, d2)).toEqual(new Date('2018-11-26T00:00:00.000Z'));
            });
        });
        describe('should round down to a month', () => {
            const i = types_1.interval('1M').unsafeGet();
            const d = new Date('2018-11-22T23:55:46.045Z');
            it('with floor/ceil', () => {
                expect(date_1.ceil(i, d)).toEqual(new Date('2018-12-01T00:00:00.000Z'));
                expect(date_1.floor(i, d)).toEqual(new Date('2018-11-01T00:00:00.000Z'));
            });
            it('with round, up', () => {
                expect(date_1.round(i, d)).toEqual(new Date('2018-12-01T00:00:00.000Z'));
            });
            it('with round, down', () => {
                const d2 = new Date('2018-11-14T00:00:00.000Z');
                expect(date_1.round(i, d2)).toEqual(new Date('2018-11-01T00:00:00.000Z'));
            });
        });
        describe('should round down to a year', () => {
            const i = types_1.interval('1Y').unsafeGet();
            const d = new Date('2018-11-22T23:55:46.045Z');
            it('with floor/ceil', () => {
                expect(date_1.ceil(i, d)).toEqual(new Date('2019-01-01T00:00:00.000Z'));
                expect(date_1.floor(i, d)).toEqual(new Date('2018-01-01T00:00:00.000Z'));
            });
            it('with round, up', () => {
                expect(date_1.round(i, d)).toEqual(new Date('2019-01-01T00:00:00.000Z'));
            });
            it('with round, down', () => {
                const d2 = new Date('2018-02-03T04:05:06.789Z');
                expect(date_1.round(i, d2)).toEqual(new Date('2018-01-01T00:00:00.000Z'));
            });
        });
    });
});
//# sourceMappingURL=date.test.js.map