"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../../errorHandling");
exports.validatePairs = (assetsMget, pairOrderingService) => (matcher, pairs) => {
    // correct order
    const incorrectPairs = pairs.filter(p => !pairOrderingService.isCorrectOrder(matcher, p).matchWith({
        Just: ({ value }) => value,
        Nothing: () => true,
    }));
    if (incorrectPairs.length)
        return task_1.rejected(new errorHandling_1.ValidationError('Wrong assets order in provided pair(s)', {
            pairs: incorrectPairs,
        }));
    // all assets exist
    const assetIdsSet = new Set();
    pairs.forEach(p => {
        assetIdsSet.add(p.amountAsset);
        assetIdsSet.add(p.priceAsset);
    });
    const assetIds = Array.from(assetIdsSet);
    return assetsMget({ ids: assetIds }).chain(assets => {
        const nonExistingIds = ramda_1.zip(assetIds, assets)
            .filter(x => x[1].matchWith({
            Just: ramda_1.F,
            Nothing: ramda_1.T,
        }))
            .map(x => x[0]);
        if (!nonExistingIds.length) {
            return task_1.of(undefined);
        }
        else {
            return task_1.rejected(new errorHandling_1.ValidationError(new Error('Assets do not exist in the blockchain'), {
                assets: nonExistingIds,
            }));
        }
    });
};
//# sourceMappingURL=pairs.js.map