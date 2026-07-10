"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.modifyDecimals = (assetsService) => (txs) => assetsService
    .precisions({
    ids: txs
        .map((tx) => [ramda_1.defaultTo('AMZX', tx.feeAsset), tx.assetId])
        .reduce((acc, cur) => acc.concat(cur), []),
})
    .map((v) => ramda_1.zipWith((tx, [feeAssetPrecision, assetPrecision]) => (Object.assign(Object.assign({}, tx), { fee: tx.fee.shiftedBy(-feeAssetPrecision), amount: tx.amount.shiftedBy(-assetPrecision) })), txs, ramda_1.splitEvery(v.length / txs.length, v)));
//# sourceMappingURL=modifyDecimals.js.map