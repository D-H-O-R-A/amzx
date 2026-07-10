"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const ramda_1 = require("ramda");
const task_1 = require("folktale/concurrency/task");
const data_entities_1 = require("@waves/data-entities");
const sql_1 = require("./sql");
const pg = knex({ client: 'pg' });
class RemoteRateRepo {
    constructor(dbDriver) {
        this.dbDriver = dbDriver;
    }
    mget(request) {
        const pairsSqlParams = ramda_1.chain((it) => [it.amountAsset, it.priceAsset], request.pairs);
        const sql = pg.raw(sql_1.default(request.pairs.length), [
            request.timestamp.getOrElse(new Date()),
            request.matcher,
            ...pairsSqlParams,
        ]);
        const dbTask = request.pairs.length === 0
            ? task_1.of([])
            : this.dbDriver.any(sql.toString());
        return dbTask.map((result) => result.map((it) => ({
            amountAsset: it.amount_asset_id,
            priceAsset: it.price_asset_id,
            rate: it.weighted_average_price || new data_entities_1.BigNumber(0),
        })));
    }
}
exports.default = RemoteRateRepo;
//# sourceMappingURL=RemoteRateRepo.js.map