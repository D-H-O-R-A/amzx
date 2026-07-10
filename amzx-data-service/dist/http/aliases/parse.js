"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../errorHandling");
const filters_1 = require("../_common/filters/filters");
const filters_2 = require("../_common/filters");
const parseArrayQuery_1 = require("../../utils/parsers/parseArrayQuery");
const parseBool_1 = require("../../utils/parsers/parseBool");
const LIMIT = 1000;
const mgetOrSearchParser = filters_2.parseFilterValues({
    aliases: parseArrayQuery_1.parseArrayQuery,
    address: filters_1.default.query,
    addresses: parseArrayQuery_1.parseArrayQuery,
    queries: parseArrayQuery_1.parseArrayQuery,
    showBroken: parseBool_1.parseBool,
});
const isMgetRequest = (req) => 'aliases' in req && Array.isArray(req.aliases);
const isSearchWithAddressRequest = (req) => typeof req.address === 'string';
const isSearchWithAddressesRequest = (req) => Array.isArray(req.addresses);
const isSearchWithQueriesRequest = (req) => Array.isArray(req.queries);
exports.get = ({ params, }) => {
    if (params) {
        return result_1.Ok({ id: params.id });
    }
    else {
        return result_1.Error(new errorHandling_1.ParseError(new Error('AliasId is required')));
    }
};
exports.mgetOrSearch = ({ query, }) => {
    if (!query) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return mgetOrSearchParser(query).chain((fValues) => {
        if (isMgetRequest(fValues)) {
            return result_1.Ok(fValues);
        }
        else {
            let fValuesWithDefaults = filters_2.withDefaults(fValues);
            fValuesWithDefaults = ramda_1.mergeAll([
                { showBroken: false },
                fValuesWithDefaults,
                { limit: LIMIT },
            ]);
            if ([
                isSearchWithAddressRequest(fValuesWithDefaults),
                isSearchWithAddressesRequest(fValuesWithDefaults),
                isSearchWithQueriesRequest(fValuesWithDefaults),
            ].filter(ramda_1.identity).length > 1) {
                return result_1.Error(new errorHandling_1.ParseError(new Error('Request contains a conflict between exclusive peers [address, addresses, queries]')));
            }
            if (isSearchWithAddressRequest(fValuesWithDefaults)) {
                if (!fValuesWithDefaults.address.length) {
                    return result_1.Error(new errorHandling_1.ParseError(new Error('`address` is not allowed to be empty')));
                }
                else {
                    return result_1.Ok(fValuesWithDefaults);
                }
            }
            else if (isSearchWithAddressesRequest(fValuesWithDefaults)) {
                if (fValuesWithDefaults.addresses.filter((v) => v.length === 0).length > 0) {
                    return result_1.Error(new errorHandling_1.ParseError(new Error('`addresses` is not allowed to be has an empty value')));
                }
                else {
                    return result_1.Ok(fValuesWithDefaults);
                }
            }
            else if (isSearchWithQueriesRequest(fValuesWithDefaults)) {
                return result_1.Ok(fValuesWithDefaults);
            }
            else {
                return result_1.Error(new errorHandling_1.ParseError(new Error('Neither `address` nor `addresses` nor `queries` were not provided')));
            }
        }
    });
};
//# sourceMappingURL=parse.js.map