"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const maybe_1 = require("folktale/maybe");
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../../errorHandling");
const parsers_1 = require("../../../utils/parsers");
const filters_1 = require("../../_common/filters");
exports.parse = ({ params, query, }) => {
    if (ramda_1.isNil(params)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Params is empty')));
    }
    if (ramda_1.isNil(query)) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return filters_1.parseFilterValues({
        pairs: parsers_1.parsePairs,
        timestamp: parsers_1.parseDate,
    })(query).chain(fValues => {
        if (ramda_1.isNil(fValues.pairs)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('Pairs are incorrect or are not set')));
        }
        return result_1.Ok({
            matcher: params.matcher,
            pairs: fValues.pairs,
            timestamp: maybe_1.fromNullable(fValues.timestamp),
        });
    });
};
//# sourceMappingURL=parse.js.map