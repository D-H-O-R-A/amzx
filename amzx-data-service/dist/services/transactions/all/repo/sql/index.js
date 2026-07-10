"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("../../../_common/sql");
const filters_1 = require("./filters");
const query_1 = require("./query");
exports.default = sql_1.createSql({
    query: query_1.select,
    filters: filters_1.filters,
    filtersOrder: filters_1.filtersOrder,
});
//# sourceMappingURL=index.js.map