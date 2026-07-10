"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const data_entities_1 = require("@waves/data-entities");
const data_1 = require("../data");
exports.partitionByPreComputed = (cache, pairs, getCacheKey, shouldCache, baseAsset) => {
    const generatePossibleRequestItems = data_1.createGeneratePossibleRequestItemsWithAsset(baseAsset);
    // pair is symmetric if amountAsset == priceAsset
    // therefore rate = 1, volume = 0
    const [symmetric, asymmetric] = ramda_1.partition(data_1.pairIsSymmetric, pairs);
    const eqRates = symmetric.map((pair) => (Object.assign({ rate: new data_entities_1.BigNumber(1), volumeWaves: new data_entities_1.BigNumber(0) }, pair)));
    const allPairsToRequest = ramda_1.uniqWith(data_1.pairsEq, ramda_1.chain((it) => generatePossibleRequestItems(it), asymmetric));
    if (shouldCache) {
        const [cached, uncached] = ramda_1.partition((it) => cache.has(getCacheKey(it)), allPairsToRequest);
        const cachedRates = cached.map((pair) => cache.get(getCacheKey(pair)).unsafeGet());
        return {
            preComputed: cachedRates.concat(eqRates),
            toBeRequested: uncached,
        };
    }
    else {
        return {
            preComputed: eqRates,
            toBeRequested: allPairsToRequest,
        };
    }
};
//# sourceMappingURL=index.js.map