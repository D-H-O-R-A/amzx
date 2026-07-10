"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyDecimals = (assetsService) => (txs) => assetsService
    .precisions({
    ids: ['WAVES'],
})
    .map(([assetPrecision]) => txs.map((tx) => (Object.assign(Object.assign({}, tx), { fee: tx.fee.shiftedBy(-assetPrecision), amount: tx.amount.shiftedBy(-assetPrecision) }))));
//# sourceMappingURL=modifyDecimals.js.map