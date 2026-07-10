"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const ramda_1 = require("ramda");
const _common_1 = require("../../_common");
const collection_1 = require("../../../utils/collection");
// @todo
// request by (id, timestamp) instead of just id
// to ensure correct tx response even if
// id is duplicated (happens in payment, alias txs)
exports.default = (repo) => (txsServices) => ({
    get: (req) => repo
        .get(req.id) //Task tx
        .chain((m) => m.matchWith({
        Just: ({ value }) => {
            return txsServices[value.type].get({
                id: value.id,
                moneyFormat: req.moneyFormat,
            });
        },
        Nothing: () => task_1.of(maybe_1.empty()),
    })),
    mget: (req) => repo
        .mget(req.ids) // Task tx[]. tx can have data: null
        .chain((txsList) => task_1.waitAll(txsList.map((m) => m.matchWith({
        Just: ({ value }) => {
            return txsServices[value.type].get({
                id: value.id,
                moneyFormat: req.moneyFormat,
            });
        },
        Nothing: () => task_1.of(maybe_1.empty()),
    })))),
    search: (req) => repo.search(req).chain((txsList) => task_1.waitAll(ramda_1.pipe(ramda_1.groupBy((t) => String(t.type)), ramda_1.toPairs, (tuples) => tuples.map(([type, txs]) => {
        return txsServices[type].mget({
            ids: txs.map((t) => t.id),
            moneyFormat: req.moneyFormat,
        });
    }))(txsList.items))
        .map((mss) => ramda_1.flatten(mss))
        .map(collection_1.collect((m) => m.getOrElse(undefined)))
        .map((txs) => {
        const s = ramda_1.indexBy((tx) => `${tx.id}:${tx.timestamp.valueOf()}`, txsList.items);
        return ramda_1.sort((a, b) => {
            const aTxUid = s[`${a.id}:${a.timestamp.valueOf()}`]['txUid'];
            const bTxUid = s[`${b.id}:${b.timestamp.valueOf()}`]['txUid'];
            return req.sort === _common_1.SortOrder.Ascending
                ? aTxUid.minus(bTxUid).toNumber()
                : bTxUid.minus(aTxUid).toNumber();
        }, txs);
    })
        .map((txs) => (Object.assign(Object.assign({}, txsList), { items: txs })))),
});
//# sourceMappingURL=index.js.map