"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyFeeDecimals = (assetsService) => (txs) => assetsService.precisions({ ids: ['WAVES'] }).map(([feeAssetPrecision]) => txs.map((tx) => (Object.assign(Object.assign({}, tx), { fee: tx.fee.shiftedBy(-feeAssetPrecision) }))));
//# sourceMappingURL=modifyFeeDecimals.js.map