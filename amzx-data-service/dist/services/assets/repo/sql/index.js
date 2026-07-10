"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const ramda_1 = require("ramda");
const common_1 = require("./common");
const searchAssets_1 = require("./searchAssets");
const pg = knex({ client: 'pg' });
const getAssetIndex = (asset_id) => pg('assets_cte').column('rn').where('asset_id', asset_id);
exports.mget = (ids) => pg({ a: 'assets' })
    .select(ramda_1.map((col) => `a.${col}`, common_1.columns))
    .select({
    issue_height: pg.raw('a.issue_height'),
    sender: pg.raw(`a.sender`),
})
    .whereIn('asset_id', ids)
    .toString();
exports.get = (id) => exports.mget([id]);
exports.search = (request) => {
    const filter = (ticker) => (q) => {
        if (ticker === '*')
            return q.whereNotNull('ticker').andWhere('ticker', '<>', '');
        else
            return q.where('ticker', ticker);
    };
    return ramda_1.compose((q) => q.toString(), (q) => q.select({
        issue_height: pg.raw('a.issue_height'),
        sender: pg.raw(`a.sender`),
    }), (request) => ramda_1.cond([
        [
            (request) => ramda_1.isNil(request.ticker),
            (request) => ramda_1.compose((q) => request.limit ? q.clone().limit(request.limit) : q, (q) => request.after
                ? q.clone().where('rn', '>', getAssetIndex(request.after))
                : q)(searchAssets_1.searchAssets(request.search)),
        ],
        [
            ramda_1.complement(ramda_1.isNil),
            (request) => ramda_1.compose(filter(request.ticker))(pg({ a: 'assets' }).select(ramda_1.map((col) => `a.${col}`, common_1.columns))),
        ],
    ])(request))(request);
};
//# sourceMappingURL=index.js.map