"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../errorHandling");
const filters_1 = require("../_common/filters");
const filters_2 = require("../_common/filters/filters");
const mgetOrSearchParser = filters_1.parseFilterValues({
    ticker: filters_2.default.query,
    search: filters_2.default.query,
});
const isMgetRequest = (req) => typeof req.ids !== 'undefined' && Array.isArray(req.ids);
const isSearchByTickerRequest = (req) => typeof req.ticker !== 'undefined';
const isFullTextSearchRequest = (req) => typeof req.search !== 'undefined';
exports.get = ({ params, }) => {
    if (params) {
        return result_1.Ok({ id: params.id });
    }
    else {
        return result_1.Error(new errorHandling_1.ParseError(new Error('AssetId is required')));
    }
};
exports.mgetOrSearch = ({ query, }) => {
    if (!query) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return mgetOrSearchParser(query).chain(fValues => {
        if (isMgetRequest(fValues)) {
            return result_1.Ok(fValues);
        }
        else {
            const fValuesWithDefaults = filters_1.withDefaults(fValues);
            if (isSearchByTickerRequest(fValuesWithDefaults)) {
                return result_1.Ok(fValuesWithDefaults);
            }
            else if (isFullTextSearchRequest(fValuesWithDefaults)) {
                return result_1.Ok(fValuesWithDefaults);
            }
            else {
                return result_1.Error(new errorHandling_1.ParseError(new Error('There is neither ticker nor search query')));
            }
        }
    });
};
//# sourceMappingURL=parse.js.map