"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const pg = knex({ client: 'pg' });
exports.truncateTable = (pairsTableName) => pg(pairsTableName)
    .truncate()
    .toString();
//# sourceMappingURL=truncateTable.js.map