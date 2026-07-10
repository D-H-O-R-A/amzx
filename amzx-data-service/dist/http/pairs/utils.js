"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const _common_1 = require("../../services/_common");
const parsers_1 = require("../../utils/parsers");
const filters_1 = require("../_common/filters");
const filters_2 = require("../_common/filters/filters");
const utils_1 = require("../_common/utils");
const PAIRS_MAX_LIMIT = 1000;
exports.parseMatchExactly = (matchExactlyRaw) => ramda_1.isNil(matchExactlyRaw)
    ? result_1.Ok(undefined)
    : parsers_1.parseArrayQuery(matchExactlyRaw).chain((ss) => typeof ss === 'undefined'
        ? result_1.Ok(undefined)
        : ss.map(parsers_1.parseBool).reduceRight((acc, cur) => {
            return acc.chain((a) => cur.matchWith({
                Ok: ({ value }) => typeof value === 'undefined' ? result_1.Ok(a) : result_1.Ok([...a, value]),
                Error: ({ value }) => result_1.Error(value),
            }));
        }, result_1.Ok([])));
exports.mgetOrSearchParser = filters_1.parseFilterValues({
    matcher: filters_2.default.query,
    pairs: parsers_1.parsePairs,
    match_exactly: exports.parseMatchExactly,
    search_by_asset: filters_2.default.query,
    search_by_assets: parsers_1.parseArrayQuery,
    limit: filters_2.limit(PAIRS_MAX_LIMIT),
});
exports.isMgetRequest = (req) => 'pairs' in req && Array.isArray(req.pairs) && utils_1.withMatcher(req);
exports.isSearchCommonRequest = (req) => 'matcher' in req &&
    typeof req.matcher === 'string' &&
    'limit' in req &&
    typeof req.limit === 'number' &&
    'sort' in req &&
    _common_1.isSortOrder(req.sort);
exports.isSearchByAssetRequest = (req) => 'search_by_asset' in req &&
    typeof req.search_by_asset === 'string' &&
    'match_exactly' in req &&
    Array.isArray(req.match_exactly) &&
    req.match_exactly.length === 1;
exports.isSearchByAssetsRequest = (req) => 'search_by_assets' in req &&
    Array.isArray(req.search_by_assets) &&
    req.search_by_assets.length == 2 &&
    'match_exactly' in req &&
    Array.isArray(req.match_exactly) &&
    req.match_exactly.length == 2;
//# sourceMappingURL=utils.js.map