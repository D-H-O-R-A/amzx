"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../errorHandling");
const loadConfig_1 = require("../../loadConfig");
const filters_1 = require("../_common/filters");
const filters_2 = require("../_common/filters/filters");
const utils_1 = require("../_common/utils");
const utils_2 = require("./utils");
const config = loadConfig_1.loadConfig();
exports.get = ({ params, query, }) => {
    if (ramda_1.isNil(params)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Params is empty')));
    }
    if (ramda_1.isNil(query)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return filters_1.parseFilterValues({
        matcher: filters_2.default.query,
    })(query).chain((fValues) => {
        const fValuesWithDefaults = ramda_1.mergeAll([
            {
                matcher: config.matcher.defaultMatcherAddress,
            },
            filters_1.withDefaults(fValues),
        ]);
        if (!utils_1.withMatcher(fValuesWithDefaults)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('Matcher is not defined')));
        }
        return result_1.Ok({
            matcher: fValuesWithDefaults.matcher,
            pair: {
                amountAsset: params.amountAsset,
                priceAsset: params.priceAsset,
            },
        });
    });
};
exports.mgetOrSearch = ({ query, }) => {
    if (!query) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return utils_2.mgetOrSearchParser(query).chain((fValues) => {
        if (utils_2.isMgetRequest(fValues)) {
            return result_1.Ok(fValues);
        }
        else {
            const fValuesWithDefaults = ramda_1.mergeAll([
                {
                    matcher: config.matcher.defaultMatcherAddress,
                },
                filters_1.withDefaults(fValues),
            ]);
            if (utils_2.isSearchCommonRequest(fValuesWithDefaults)) {
                if (utils_2.isSearchByAssetRequest(fValuesWithDefaults)) {
                    return result_1.Ok(fValuesWithDefaults);
                }
                else if (utils_2.isSearchByAssetsRequest(fValuesWithDefaults)) {
                    return result_1.Ok(fValuesWithDefaults);
                }
                else {
                    return result_1.Ok(fValuesWithDefaults);
                }
            }
            else {
                return result_1.Error(new errorHandling_1.ParseError(new Error('Invalid request data'), fValuesWithDefaults));
            }
        }
    });
};
//# sourceMappingURL=parse.js.map