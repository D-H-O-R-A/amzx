"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../errorHandling");
const regex_1 = require("../utils/regex");
var Unit;
(function (Unit) {
    Unit["Second"] = "s";
    Unit["Minute"] = "m";
    Unit["Hour"] = "h";
    Unit["Day"] = "d";
    Unit["Week"] = "w";
    Unit["Month"] = "M";
    Unit["Year"] = "Y";
})(Unit = exports.Unit || (exports.Unit = {}));
exports.units = {
    [Unit.Second]: 1,
    [Unit.Minute]: 60,
    [Unit.Hour]: 60 * 60,
    [Unit.Day]: 60 * 60 * 24,
    [Unit.Week]: 60 * 60 * 24 * 7,
    [Unit.Month]: 60 * 60 * 24 * 31,
    [Unit.Year]: 60 * 60 * 24 * 31 * 366,
};
exports.parseUnit = (s) => {
    switch (s.slice(-1)) {
        case Unit.Second:
            return result_1.Ok(Unit.Second);
        case Unit.Minute:
            return result_1.Ok(Unit.Minute);
        case Unit.Hour:
            return result_1.Ok(Unit.Hour);
        case Unit.Day:
            return result_1.Ok(Unit.Day);
        case Unit.Week:
            return result_1.Ok(Unit.Week);
        case Unit.Month:
            return result_1.Ok(Unit.Month);
        case Unit.Year:
            return result_1.Ok(Unit.Year);
        default:
            return result_1.Error(new errorHandling_1.ValidationError(`Provided string (${s}) is not a valid unit`));
    }
};
/** Calculates interval length in milliseconds **/
const parseLength = (s, unit) => {
    const sub = s.slice(0, s.length - 1);
    const n = parseInt(sub);
    return !isNaN(n)
        ? result_1.Ok(n * exports.units[unit] * 1000)
        : result_1.Error(new errorHandling_1.ValidationError(`Provided string (${s}) is not a valid interval length`));
};
exports.interval = (source) => {
    if (!regex_1.interval.test(source))
        return result_1.Error(new errorHandling_1.ValidationError(`Provided string (${source}) is not valid interval`));
    return exports.parseUnit(source).matchWith({
        Ok: ({ value: unit }) => {
            return parseLength(source, unit).matchWith({
                Ok: ({ value: length }) => result_1.Ok({
                    length,
                    unit,
                    source,
                }),
                Error: ({ value: e }) => result_1.Error(e),
            });
        },
        Error: ({ value: e }) => result_1.Error(e),
    });
};
//# sourceMappingURL=interval.js.map