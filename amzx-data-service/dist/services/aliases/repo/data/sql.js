"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const ramda_1 = require("ramda");
const pg = knex({ client: 'pg' });
const columns = ['alias', 'address', 'duplicates'];
const columnsWithRowNumber = [...columns, 'rn'];
// address has 31 <= length <= 45
// alias has 4 <= length <= 15
const minAddressLength = 31;
const isAddress = (addressOrAlias) => addressOrAlias.length >= minAddressLength;
const getAliasRowNumber = (after) => pg('aliases_cte').select('rn').where('alias', after);
const baseQuery = (qb) => qb.from({ t: 'txs_10' }).select('t.uid');
const selectAfterFilters = (filtered) => pg.select(columns).from({ a: filtered });
const filterByAliases = (qb, aliasSet) => qb.whereIn('t.alias', aliasSet);
const selectFilteredAliases = (filtered) => pg.from({
    counted_aliases: pg({ t: 'txs_10' })
        .select('t.alias')
        .min({ address: 't.sender' }) // first sender
        .count({ duplicates: 't.sender' }) // count senders grouped by alias
        .column({ rn: pg.raw('row_number() over (order by min(t.uid))') }) // rn for pagination
        .whereIn('t.uid', filtered)
        .groupBy('t.alias'),
});
const withAddress = (req) => typeof req.address === 'string';
const withAddresses = (req) => Array.isArray(req.addresses);
const withQueries = (req) => Array.isArray(req.queries);
exports.default = {
    get: (alias) => selectAfterFilters(selectFilteredAliases(filterByAliases(baseQuery(pg()), [alias])))
        .clone()
        .toString(),
    mget: (aliases) => selectAfterFilters(selectFilteredAliases(filterByAliases(baseQuery(pg()), aliases)))
        .clone()
        .toString(),
    search: (req) => {
        const query = baseQuery(pg());
        let aliases = [];
        if (withAddress(req)) {
            query.where('sender', req.address);
        }
        else if (withAddresses(req)) {
            query.whereIn('sender', req.addresses);
        }
        else if (withQueries(req)) {
            query.whereIn('sender', req.queries.filter(isAddress));
            aliases = req.queries.filter(ramda_1.complement(isAddress));
            query.unionAll((qb) => filterByAliases(baseQuery(qb), aliases));
        }
        const q = selectAfterFilters(pg('aliases_cte').with('aliases_cte', selectFilteredAliases(query).distinct().select(columnsWithRowNumber)))
            .orderBy('rn', 'asc')
            .limit(req.limit);
        return ramda_1.compose(
        // aliases are considered broken if 'duplicates' not equal to 1
        (q) => req.showBroken
            ? q.toString()
            : q.clone().where('duplicates', 1).toString(), (q) => (req.after ? q.where('rn', '>', getAliasRowNumber(req.after)) : q))(q);
    },
};
//# sourceMappingURL=sql.js.map