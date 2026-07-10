"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../errorHandling");
const loadConfig_1 = require("../../loadConfig");
const filters_1 = require("../_common/filters");
const filters_2 = require("../_common/filters/filters");
const utils_1 = require("../_common/utils");
const interval_1 = require("../../types/interval");
const interval_2 = require("../../utils/interval");
const types_1 = require("../../types");
const config = loadConfig_1.loadConfig();
exports.MAX_CANDLES_COUNT = 1440;
exports.CandleIntervals = [
    types_1.CandleInterval.Month1,
    types_1.CandleInterval.Week1,
    types_1.CandleInterval.Day1,
    types_1.CandleInterval.Hour12,
    types_1.CandleInterval.Hour6,
    types_1.CandleInterval.Hour4,
    types_1.CandleInterval.Hour3,
    types_1.CandleInterval.Hour2,
    types_1.CandleInterval.Hour1,
    types_1.CandleInterval.Minute30,
    types_1.CandleInterval.Minute15,
    types_1.CandleInterval.Minute5,
    types_1.CandleInterval.Minute1,
];
exports.parseInterval = ({ min, max, divisibleBy, allowed }) => (v) => filters_2.default.query(v).chain((s) => {
    if (ramda_1.isNil(s))
        return result_1.Ok(s);
    else {
        return interval_1.interval(s)
            .chain((i) => {
            if (i.length < min.length) {
                return result_1.Error(new errorHandling_1.ValidationError(`Provided interval is smaller then minimum allowed`, {
                    allowed: min.source,
                    actual: i.source,
                }));
            }
            if (i.length > max.length) {
                return result_1.Error(new errorHandling_1.ValidationError(`Provided interval is bigger then maximum allowed`, {
                    allowed: max.source,
                    actual: i.source,
                }));
            }
            const d = interval_2.div(i, divisibleBy);
            if (d % 1 > 0) {
                return result_1.Error(new errorHandling_1.ValidationError(`Interval must be divisible by ${divisibleBy.source}`));
            }
            if (Array.isArray(allowed) &&
                allowed.length > 0 &&
                ramda_1.isNil(allowed.find((candleInterval) => candleInterval == i.source))) {
                return result_1.Error(new errorHandling_1.ValidationError('Interval must be one of the allowed', {
                    allowed,
                    actual: i.source,
                }));
            }
            return result_1.Ok(i);
        })
            .mapError((e) => {
            return errorHandling_1.isJoiError(e.meta)
                ? new errorHandling_1.ParseError(e.error)
                : new errorHandling_1.ParseError(e.error, e.meta);
        });
    }
});
exports.parse = ({ params, query, }) => {
    if (ramda_1.isNil(params)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Params is empty')));
    }
    if (ramda_1.isNil(query)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    const minInterval = interval_1.interval('1m').unsafeGet();
    const maxInterval = interval_1.interval('1M').unsafeGet();
    return filters_1.parseFilterValues({
        matcher: filters_2.default.query,
        interval: exports.parseInterval({
            min: minInterval,
            max: maxInterval,
            divisibleBy: minInterval,
            allowed: exports.CandleIntervals,
        }),
    })(query).chain((fValues) => {
        const fValuesWithDefaults = ramda_1.mergeAll([
            {
                matcher: config.matcher.defaultMatcherAddress,
                timeEnd: new Date(),
            },
            filters_1.withDefaults(fValues),
        ]);
        if (!utils_1.withMatcher(fValuesWithDefaults)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('Matcher is not defined')));
        }
        if (ramda_1.isNil(fValuesWithDefaults.timeStart)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('timeStart is required')));
        }
        if (ramda_1.isNil(fValuesWithDefaults.interval)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('interval is required')));
        }
        if (ramda_1.isNil(fValuesWithDefaults.matcher)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('matcher is required')));
        }
        const periodLength = fValuesWithDefaults.timeEnd.getTime() - fValuesWithDefaults.timeStart.getTime();
        const expectedCandlesCount = Math.ceil(periodLength / fValuesWithDefaults.interval.length);
        if (expectedCandlesCount > exports.MAX_CANDLES_COUNT) {
            return result_1.Error(new errorHandling_1.ParseError(new Error(`${expectedCandlesCount} of candles is more then allowed of ${exports.MAX_CANDLES_COUNT}. Try to decrease requested period of time.`)));
        }
        return result_1.Ok({
            amountAsset: params.amountAsset,
            priceAsset: params.priceAsset,
            matcher: fValuesWithDefaults.matcher,
            timeStart: fValuesWithDefaults.timeStart,
            timeEnd: fValuesWithDefaults.timeEnd,
            interval: fValuesWithDefaults.interval,
        });
    });
};
//# sourceMappingURL=parse.js.map