"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../errorHandling");
const ramda_1 = require("ramda");
const interval_1 = require("../types/interval");
exports.div = (a, b) => a.length / b.length;
exports.fromMilliseconds = (milliseconds) => {
    const secs = milliseconds / 1000;
    const unitsValues = ramda_1.values(interval_1.units);
    let unitIndex = ramda_1.findLastIndex((x) => x >= secs && secs % x == 0)(unitsValues);
    // 'Second' unit is by default
    if (!~unitIndex) {
        unitIndex = 0;
    }
    return interval_1.parseUnit(Object.keys(interval_1.units)[unitIndex]).matchWith({
        Ok: ({ value: unit }) => {
            const length = secs / interval_1.units[unit];
            // whether length is integer
            if (length % 1 === 0) {
                return result_1.Ok({
                    length: milliseconds,
                    unit,
                    source: `${length}${unit}`,
                });
            }
            else {
                return result_1.Error(new errorHandling_1.ValidationError('Provided milliseconds number is not a valid number'));
            }
        },
        Error: ({ value: e }) => result_1.Error(e),
    });
};
exports.unsafeIntervalsFromStrings = (strings) => strings.map(str => interval_1.interval(str).unsafeGet());
exports.unsafeIntervalsFromStringsReversed = ramda_1.compose(ramda_1.reverse, exports.unsafeIntervalsFromStrings);
//# sourceMappingURL=interval.js.map