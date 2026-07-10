"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../../errorHandling");
const interval_1 = require("../../../types/interval");
const filters_1 = require("../../_common/filters");
const parse_1 = require("../../candles/parse");
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
        interval: parse_1.parseInterval({
            min: minInterval,
            max: maxInterval,
            divisibleBy: minInterval,
            allowed: parse_1.CandleIntervals,
        }),
    })(query).chain((fValues) => {
        const fValuesWithDefaults = ramda_1.mergeAll([
            {
                timeEnd: new Date(),
            },
            filters_1.withDefaults(fValues),
        ]);
        if (ramda_1.isNil(fValuesWithDefaults.timeStart)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('timeStart is undefined')));
        }
        if (ramda_1.isNil(fValuesWithDefaults.interval)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('interval is undefined')));
        }
        const periodLength = fValuesWithDefaults.timeEnd.getTime() - fValuesWithDefaults.timeStart.getTime();
        const expectedCandlesCount = Math.ceil(periodLength / fValuesWithDefaults.interval.length);
        if (expectedCandlesCount > parse_1.MAX_CANDLES_COUNT) {
            return result_1.Error(new errorHandling_1.ParseError(new Error(`${expectedCandlesCount} of candles is more then allowed of ${parse_1.MAX_CANDLES_COUNT}. Try to decrease requested period of time.`)));
        }
        return result_1.Ok({
            amountAsset: params.amountAsset,
            priceAsset: params.priceAsset,
            matcher: params.matcher,
            timeStart: fValuesWithDefaults.timeStart,
            timeEnd: fValuesWithDefaults.timeEnd,
            interval: fValuesWithDefaults.interval,
        });
    });
};
//# sourceMappingURL=parse.js.map