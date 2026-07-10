"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
exports.pairIsSymmetric = util_1.isSymmetric((p) => [
    p.amountAsset,
    p.priceAsset,
]);
exports.createPairHasBaseAsset = (baseAssetId) => (pair) => pair.amountAsset.id === baseAssetId || pair.priceAsset.id === baseAssetId;
function flip(pair) {
    return Object.assign(Object.assign({}, pair), { amountAsset: pair.priceAsset, priceAsset: pair.amountAsset });
}
exports.flip = flip;
exports.pairsEq = (pair1, pair2) => pair1.amountAsset.id === pair2.amountAsset.id &&
    pair1.priceAsset.id === pair2.priceAsset.id;
function createGeneratePossibleRequestItemsWithAsset(baseAsset) {
    const pairHasBaseAsset = exports.createPairHasBaseAsset(baseAsset.id);
    return (pair) => {
        if (pairHasBaseAsset(pair)) {
            return [pair, flip(pair)];
        }
        const baseAssetL = {
            amountAsset: pair.amountAsset,
            priceAsset: baseAsset,
        };
        const baseAssetR = {
            amountAsset: pair.priceAsset,
            priceAsset: baseAsset,
        };
        return [baseAssetL, flip(baseAssetL), baseAssetR, flip(baseAssetR), pair, flip(pair)];
    };
}
exports.createGeneratePossibleRequestItemsWithAsset = createGeneratePossibleRequestItemsWithAsset;
//# sourceMappingURL=data.js.map