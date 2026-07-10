"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../../../types");
const utils_1 = require("../utils");
const interval_1 = require("../../../../../utils/interval");
describe('candles sql helper functions', () => {
    it('highest divider less then', () => {
        expect(utils_1.highestDividerLessThan(types_1.interval('1m').unsafeGet(), interval_1.unsafeIntervalsFromStrings(['1m', '1h', '1d'])).unsafeGet().length).toBe(types_1.interval('1m').unsafeGet().length);
        expect(utils_1.highestDividerLessThan(types_1.interval('10m').unsafeGet(), interval_1.unsafeIntervalsFromStrings(['5m', '15m', '1h'])).unsafeGet().length).toBe(types_1.interval('5m').unsafeGet().length);
        expect(utils_1.highestDividerLessThan(types_1.interval('15m').unsafeGet(), interval_1.unsafeIntervalsFromStrings(['5m', '15m', '1h'])).unsafeGet().length).toBe(types_1.interval('15m').unsafeGet().length);
        expect(utils_1.highestDividerLessThan(types_1.interval('1h').unsafeGet(), interval_1.unsafeIntervalsFromStrings(['1m', '1h', '1d'])).unsafeGet().length).toBe(types_1.interval('1h').unsafeGet().length);
    });
});
//# sourceMappingURL=utils.test.js.map