"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.modifyDecimals = (assetsService) => (txs) => assetsService
    .precisions({
    ids: txs
        .map((tx) => [ramda_1.defaultTo('AMZX', tx.feeAssetId)].concat(tx.payment.map((p) => p.assetId)))
        .reduce((acc, cur) => acc.concat(cur), []),
})
    .map((precisions) => txs.map((tx) => {
    let currentTxValues = precisions.splice(0, 1 + tx.payment.length);
    return Object.assign(Object.assign({}, tx), { fee: tx.fee.shiftedBy(-currentTxValues[0]), payment: tx.payment.map((p, idx) => (Object.assign(Object.assign({}, p), { amount: p.amount.shiftedBy(-currentTxValues[idx + 1]) }))) });
}));
//# sourceMappingURL=modifyDecimals.js.map