"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("../../../../_common/sql");
const query_1 = require("./query");
const filters_1 = require("./filters");
const queryAfterFilters = {
    get: query_1.selectFromFiltered,
    mget: query_1.selectFromFiltered,
    search: query_1.selectFromFiltered,
};
exports.default = sql_1.createSql({
    query: query_1.select,
    filters: filters_1.filters,
    filtersOrder: filters_1.filtersOrder,
    queryAfterFilters,
});
//# sourceMappingURL=index.js.map