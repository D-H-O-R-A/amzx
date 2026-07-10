"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LRU = require("lru-cache");
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const __1 = require("../..");
const types_1 = require("../types");
class ThresholdAssetRateService {
    constructor(thresholdAssetId, matcherAddress, pairsService, logger) {
        this.thresholdAssetId = thresholdAssetId;
        this.matcherAddress = matcherAddress;
        this.pairsService = pairsService;
        this.logger = logger;
        this.cache = new LRU({ maxAge: 60000 });
    }
    get() {
        let rate = this.cache.get(this.thresholdAssetId);
        if (rate === undefined) {
            // rate was not set or is stale
            return this.pairsService
                .get({
                pair: {
                    amountAsset: __1.WavesId,
                    priceAsset: this.thresholdAssetId,
                },
                matcher: this.matcherAddress,
                moneyFormat: types_1.MoneyFormat.Long,
            })
                .chain((m) => {
                return m.matchWith({
                    Just: ({ value }) => {
                        if (value === null) {
                            this.logger({
                                message: 'GET_THRESHOLD_RATE',
                                data: `Rate for pair WAVES/${this.thresholdAssetId} not found`,
                            });
                            return task_1.of(maybe_1.empty());
                        }
                        this.cache.set(this.thresholdAssetId, value.weightedAveragePrice);
                        return task_1.of(maybe_1.of(value.weightedAveragePrice));
                    },
                    Nothing: () => {
                        this.logger({
                            message: 'GET_THRESHOLD_RATE',
                            data: `Pair WAVES/${this.thresholdAssetId} not found`,
                        });
                        return task_1.of(maybe_1.empty());
                    },
                });
            });
        }
        else {
            return task_1.of(maybe_1.of(rate));
        }
    }
}
exports.ThresholdAssetRateService = ThresholdAssetRateService;
//# sourceMappingURL=ThresholdAssetRateService.js.map