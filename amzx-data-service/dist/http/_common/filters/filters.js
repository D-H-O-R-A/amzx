"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../../errorHandling");
const _common_1 = require("../../../services/_common");
const parsers_1 = require("../../../utils/parsers");
const _1 = require("./");
// default limit is 100
exports.limit = (max) => (raw) => {
    if (ramda_1.isNil(raw)) {
        return result_1.Ok(undefined);
    }
    else {
        const n = parseInt(raw);
        if (isNaN(n)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('limit has to be a number')));
        }
        else if (n > max) {
            return result_1.Error(new errorHandling_1.ParseError(new Error(`Max limit ${max} exceeded`)));
        }
        else {
            return result_1.Ok(n);
        }
    }
};
// default sort is SortOrder.Descending
const sort = (s) => typeof s === 'undefined'
    ? result_1.Ok(undefined)
    : _common_1.isSortOrder(s)
        ? result_1.Ok(s)
        : result_1.Error(new errorHandling_1.ParseError(new Error('Invalid sort value')));
const after = parsers_1.parseTrimmedStringIfDefined;
exports.default = {
    timeStart: parsers_1.parseDate,
    timeEnd: parsers_1.parseDate,
    blockTimeStart: parsers_1.parseDate,
    blockTimeEnd: parsers_1.parseDate,
    limit: exports.limit(_1.DEFAULT_MAX_LIMIT),
    sender: parsers_1.parseTrimmedStringIfDefined,
    senders: parsers_1.parseArrayQuery,
    sort,
    after,
    ids: parsers_1.parseArrayQuery,
    query: parsers_1.parseTrimmedStringIfDefined,
};
//# sourceMappingURL=filters.js.map