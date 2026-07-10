"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../../errorHandling");
const filters_1 = require("../../_common/filters");
const utils_1 = require("../../pairs/utils");
exports.get = ({ params, }) => {
    if (ramda_1.isNil(params)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Params is empty')));
    }
    if (params.amountAsset && params.priceAsset) {
        return result_1.Ok({
            matcher: params.matcher,
            pair: {
                amountAsset: params.amountAsset,
                priceAsset: params.priceAsset,
            },
        });
    }
    else {
        return result_1.Error(new errorHandling_1.ParseError(new Error('AmountAssetId or PriceAssetId are not set')));
    }
};
exports.mgetOrSearch = ({ params, query, }) => {
    if (ramda_1.isNil(params)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Params is empty')));
    }
    if (ramda_1.isNil(query)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return utils_1.mgetOrSearchParser(query).chain(fValues => {
        if (utils_1.isMgetRequest(fValues)) {
            return result_1.Ok({
                pairs: fValues.pairs,
                matcher: params.matcher,
            });
        }
        else {
            const fValuesWithDefaults = ramda_1.mergeAll([
                filters_1.withDefaults(fValues),
                {
                    matcher: params.matcher,
                },
            ]);
            if (utils_1.isSearchCommonRequest(fValuesWithDefaults)) {
                if (utils_1.isSearchByAssetRequest(fValuesWithDefaults)) {
                    return result_1.Ok(fValuesWithDefaults);
                }
                else if (utils_1.isSearchByAssetsRequest(fValuesWithDefaults)) {
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