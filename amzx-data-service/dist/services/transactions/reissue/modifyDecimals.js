"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.modifyDecimals = (assetsService) => (txs) => assetsService
    .precisions({
    ids: ['AMZX'].concat(txs.map((tx) => tx.assetId)),
})
    .map((precisions) => {
    const feePrecision = precisions.splice(0, 1)[0];
    return ramda_1.zipWith((tx, assetPrecision) => (Object.assign(Object.assign({}, tx), { fee: tx.fee.shiftedBy(-feePrecision), quantity: tx.quantity.shiftedBy(-assetPrecision) })), txs, precisions);
});
//# sourceMappingURL=modifyDecimals.js.map