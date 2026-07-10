"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const filters_1 = require("./filters");
const _common_1 = require("../../../services/_common");
const DEFAULT_LIMIT = 100;
const DEFAULT_SORT = _common_1.SortOrder.Descending;
exports.DEFAULT_MAX_LIMIT = DEFAULT_LIMIT;
exports.withDefaults = (fValues) => ramda_1.merge({
    sort: DEFAULT_SORT,
    limit: DEFAULT_LIMIT,
}, fValues);
exports.parseFilterValues = (filters) => (values) => ramda_1.compose(r => r.map(ramda_1.reject(ramda_1.isNil)), d => Object.keys(d).reduce((acc, cur) => acc.chain(a => d[cur].matchWith({
    Ok: ({ value }) => result_1.Ok(Object.assign(Object.assign({}, a), { [cur]: value })),
    Error: ({ value }) => result_1.Error(value),
})), result_1.Ok({})), ramda_1.mapObjIndexed((val, key) => val(values[key])))(Object.assign(Object.assign({}, filters_1.default), filters));
//# sourceMappingURL=index.js.map