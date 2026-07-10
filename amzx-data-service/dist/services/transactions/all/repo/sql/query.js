"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const pg = knex({ client: 'pg' });
exports.select = pg({ t: 'txs' }).select({
    uid: 't.uid',
    tx_type: 't.tx_type',
    id: 't.id',
    time_stamp: 't.time_stamp',
});
//# sourceMappingURL=query.js.map