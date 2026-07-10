"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const types_1 = require("../../types");
const interval_1 = require("../../types/interval");
const precisions = {
    [types_1.Unit.Year]: 4,
    [types_1.Unit.Month]: 7,
    [types_1.Unit.Week]: 10,
    [types_1.Unit.Day]: 10,
    [types_1.Unit.Hour]: 13,
    [types_1.Unit.Minute]: 16,
    [types_1.Unit.Second]: 19,
};
const suffixes = {
    [types_1.Unit.Year]: '-01-01T00:00:00.000Z',
    [types_1.Unit.Month]: '-01T00:00:00.000Z',
    [types_1.Unit.Week]: 'T00:00:00.000Z',
    [types_1.Unit.Day]: 'T00:00:00.000Z',
    [types_1.Unit.Hour]: ':00:00.000Z',
    [types_1.Unit.Minute]: ':00.000Z',
    [types_1.Unit.Second]: 'Z',
};
const unitsAsc = [
    types_1.Unit.Second,
    types_1.Unit.Minute,
    types_1.Unit.Hour,
    types_1.Unit.Day,
    types_1.Unit.Week,
    types_1.Unit.Month,
    types_1.Unit.Year,
];
var Order;
(function (Order) {
    Order[Order["Less"] = -1] = "Less";
    Order[Order["Equals"] = 0] = "Equals";
    Order[Order["Bigger"] = 1] = "Bigger";
})(Order || (Order = {}));
const unitsOrder = (units) => (a, b) => units.indexOf(a) < units.indexOf(b)
    ? Order.Less
    : units.indexOf(a) === units.indexOf(b)
        ? Order.Equals
        : Order.Bigger;
const roundUp = (x) => Math.ceil(x);
const roundDown = (x) => Math.floor(x);
const defaultRound = (x) => Math.round(x);
const roundTo = ramda_1.curry((ascOrderedUnits, roundFn, interval, date) => {
    if (!interval) {
        throw new Error('Invalid Interval');
    }
    const unitsAscOrder = unitsOrder(ascOrderedUnits);
    return ascOrderedUnits.reduce((date, currentUnit) => {
        if ([Order.Less, Order.Equals].includes(unitsAscOrder(currentUnit, interval.unit))) {
            // round week
            if (currentUnit === types_1.Unit.Week) {
                const newDate = new Date(date);
                if (interval.unit === types_1.Unit.Week) {
                    newDate.setUTCDate(newDate.getUTCDate() -
                        newDate.getUTCDay() +
                        roundFn((newDate.getUTCDay() - 1) / 7) * 7 +
                        1);
                }
                return newDate;
            }
            else if (currentUnit === types_1.Unit.Month) {
                const newDate = new Date(date);
                // round month (not greater than 1 month)
                const d = daysInMonth(newDate.getUTCFullYear(), newDate.getUTCMonth());
                newDate.setUTCDate(roundFn((newDate.getUTCDate() - 1) / d) * d + 1);
                return newDate;
            }
            else if (currentUnit === types_1.Unit.Year) {
                // round year  (not greater than 1 year)
                const newDate = new Date(date);
                newDate.setUTCMonth(roundFn(newDate.getUTCMonth() / 12) * 12);
                return newDate;
            }
            else {
                // round ms, seconds, minutes, hours
                const unitLength = currentUnit === interval.unit
                    ? interval.length
                    : interval_1.units[currentUnit] * 1000;
                return new Date(roundFn(date.getTime() / unitLength) * unitLength);
            }
        }
        else {
            return date;
        }
    }, new Date(date));
});
const roundToWithUnits = roundTo(unitsAsc);
exports.round = roundToWithUnits(defaultRound);
exports.floor = roundToWithUnits(roundDown);
exports.ceil = roundToWithUnits(roundUp);
exports.trunc = ramda_1.curry((unit, date) => {
    const newDate = new Date(date);
    if (unit === types_1.Unit.Week) {
        return (new Date(newDate.setUTCDate(newDate.getUTCDate() - newDate.getUTCDay() + 1))
            .toISOString()
            .substr(0, precisions[types_1.Unit.Day]) + suffixes[types_1.Unit.Day]);
    }
    else {
        return newDate.toISOString().substr(0, precisions[unit]) + suffixes[unit];
    }
});
exports.add = ramda_1.curry((interval, date) => new Date(date.getTime() + interval.length));
exports.subtract = ramda_1.curry((interval, date) => new Date(date.getTime() - interval.length));
const daysInMonth = (year, month) => 
// next month (month + 1) with 0 date of month -> last date of month
new Date(year, month + 1, 0).getDate();
//# sourceMappingURL=index.js.map