"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { always, complement, compose, cond, either, filter, groupBy, isEmpty, isNil, map, omit, prop, sortBy, T, values, } = require('ramda');
const isNotNil = complement(isNil);
const getTransferItem = (txRaw) => ({
    recipient: txRaw.recipient_alias || txRaw.recipient_address,
    amount: txRaw.amount,
    positionInTx: txRaw.position_in_tx,
});
const removeUnnecessaryFromRaw = omit([
    'recipient_address',
    'recipient_alias',
    'amount',
    'position_in_tx',
]);
const buildTxFromTxs = (txs) => {
    if (!Array.isArray(txs) || !txs.length) {
        return null;
    }
    const firstRaw = txs[0];
    const tx = removeUnnecessaryFromRaw(firstRaw);
    // fill tx.transfers
    tx.transfers = compose(map(omit(['positionInTx'])), sortBy(prop('positionInTx')), map(getTransferItem), filter((tx) => isNotNil(prop('amount', tx))))(txs);
    return tx;
};
/**
 * Db returns list of object
 * { ...txAttributes, ...transferAttributes }
 * Need to restore transaction nested structure, grouping by
 * txAttributes and putting transfer objects nested into the tx,
 * preserving transfers order by sorting on `position_in_tx`
 */
exports.transformResult = (t) => cond([
    [either(isNil, isEmpty), always([])],
    [T, compose(map(buildTxFromTxs), values, groupBy(prop('id')))],
])(t);
//# sourceMappingURL=transformResult.js.map