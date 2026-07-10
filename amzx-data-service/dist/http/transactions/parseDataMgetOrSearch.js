"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const data_entities_1 = require("@waves/data-entities");
const errorHandling_1 = require("../../errorHandling");
const types_1 = require("../../types");
const filters_1 = require("../_common/filters");
const filters_2 = require("../_common/filters/filters");
const parseBool_1 = require("../../utils/parsers/parseBool");
const _common_1 = require("./_common");
const isDataEntryType = (raw) => [
    types_1.DataEntryType.Binary,
    types_1.DataEntryType.Boolean,
    types_1.DataEntryType.Integer,
    types_1.DataEntryType.String,
].includes(raw);
function parseValue(type, value) {
    if (type === undefined || value === undefined)
        return result_1.Ok(undefined);
    if (type === types_1.DataEntryType.Boolean)
        return parseBool_1.parseBool(value);
    else if (type === types_1.DataEntryType.Integer) {
        try {
            const v = new data_entities_1.BigNumber(value);
            if (v.isNaN()) {
                throw new Error('Provided value is not a number');
            }
            else {
                return result_1.Ok(v);
            }
        }
        catch (e) {
            return result_1.Error(new errorHandling_1.ParseError(e));
        }
    }
    else
        return result_1.Ok(value);
}
const parseDataEntryType = (raw) => {
    if (ramda_1.isNil(raw))
        return result_1.Ok(undefined);
    if (isDataEntryType(raw)) {
        return result_1.Ok(raw);
    }
    else {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Invalid type param value')));
    }
};
exports.parseDataMgetOrSearch = ({ query, }) => {
    if (!query) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return filters_1.parseFilterValues({
        key: filters_2.default.query,
        type: parseDataEntryType,
        value: filters_2.default.query,
    })(query).chain((fValues) => {
        if (_common_1.isMgetRequest(fValues)) {
            return result_1.Ok(fValues);
        }
        else {
            const fValuesWithDefaults = filters_1.withDefaults(fValues);
            if (!ramda_1.isNil(fValuesWithDefaults.value) &&
                ramda_1.isNil(fValuesWithDefaults.type)) {
                return result_1.Error(new errorHandling_1.ParseError(new Error('Type param has to be set with value param')));
            }
            return parseValue(fValuesWithDefaults.type, fValuesWithDefaults.value).map((value) => (Object.assign(Object.assign({}, fValuesWithDefaults), (value ? { value } : {}))));
        }
    });
};
//# sourceMappingURL=parseDataMgetOrSearch.js.map