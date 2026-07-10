"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyDecimals = (assetsService) => (txs) => assetsService
    .precisions({
    ids: ['WAVES'].concat(txs.map((tx) => tx.assetId)),
})
    .map((precisions) => {
    const feePrecision = precisions.splice(0, 1)[0];
    return txs.map((tx, idx) => (Object.assign(Object.assign({}, tx), { fee: tx.fee.shiftedBy(-feePrecision), quantity: tx.quantity.shiftedBy(-precisions[idx]) })));
});
//# sourceMappingURL=modifyDecimals.js.map