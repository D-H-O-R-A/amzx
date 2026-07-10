"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.modifyDecimals = (assetsService) => (txs) => assetsService
    .precisions({
    ids: txs
        .map((tx) => ramda_1.compose((a) => ramda_1.isNil(tx.minSponsoredAssetFee) ? a : a.concat(tx.assetId))(['AMZX']))
        .reduce((acc, cur) => acc.concat(cur), []),
})
    .map((v) => txs.map((tx) => {
    let currentTxValues = v.splice(0, ramda_1.isNil(tx.minSponsoredAssetFee) ? 1 : 2);
    return Object.assign(Object.assign({}, tx), { fee: tx.fee.shiftedBy(-currentTxValues[0]), minSponsoredAssetFee: ramda_1.isNil(tx.minSponsoredAssetFee)
            ? null
            : tx.minSponsoredAssetFee.shiftedBy(-currentTxValues[1]) });
}));
//# sourceMappingURL=modifyDecimals.js.map