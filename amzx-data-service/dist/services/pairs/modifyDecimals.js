"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
exports.modifyDecimals = (assetsService) => (pairs) => assetsService
    .precisions({
    ids: pairs.reduce((acc, pair) => acc.concat([pair.amountAsset, pair.priceAsset]), []),
})
    .chain((precisions) => {
    return task_1.of(pairs.map((pair, idx) => {
        const amountAssetDecimals = precisions[idx * 2];
        const priceAssetDecimals = precisions[idx * 2 + 1];
        const priceDecimals = -8 - priceAssetDecimals + amountAssetDecimals;
        return Object.assign(Object.assign({}, pair), { low: pair.low.shiftedBy(priceDecimals), high: pair.high.shiftedBy(priceDecimals), firstPrice: pair.firstPrice.shiftedBy(priceDecimals), lastPrice: pair.lastPrice.shiftedBy(priceDecimals), volume: pair.volume.shiftedBy(-amountAssetDecimals), quoteVolume: pair.quoteVolume.shiftedBy(priceDecimals - amountAssetDecimals), volumeWaves: pair.volumeWaves === null
                ? null
                : pair.amountAsset === 'WAVES'
                    ? pair.volumeWaves.shiftedBy(-amountAssetDecimals)
                    : pair.priceAsset === 'WAVES'
                        ? pair.volumeWaves.shiftedBy(priceDecimals - amountAssetDecimals)
                        : pair.volumeWaves.shiftedBy(priceDecimals - 8 - amountAssetDecimals), weightedAveragePrice: pair.weightedAveragePrice.shiftedBy(priceDecimals) });
    }));
});
//# sourceMappingURL=modifyDecimals.js.map