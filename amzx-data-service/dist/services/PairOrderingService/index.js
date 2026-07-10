"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const loadMatcherSettings_1 = require("./loadMatcherSettings");
const ramda_1 = require("ramda");
const assets_pairs_order_1 = require("@waves/assets-pairs-order");
class PairOrderingServiceImpl {
    constructor(matchersSettings) {
        this.orderPair = ramda_1.map(assets_pairs_order_1.createOrderPair, matchersSettings);
    }
    static create(matchersSettingsURLs) {
        const matcherAddresses = Object.keys(matchersSettingsURLs);
        const matcherSettingsTasks = matcherAddresses.map(ma => loadMatcherSettings_1.loadMatcherSettings(matchersSettingsURLs[ma]).map(s => s.priceAssets));
        return task_1.waitAll(matcherSettingsTasks)
            .map(settings => ramda_1.zipObj(matcherAddresses, settings))
            .map(s => new PairOrderingServiceImpl(s));
    }
    getCorrectOrder(matcher, pair) {
        if (!this.orderPair[matcher])
            return maybe_1.empty();
        else {
            const correctOrder = this.orderPair[matcher](pair[0], pair[1]);
            return maybe_1.of({
                amountAsset: correctOrder[0],
                priceAsset: correctOrder[1],
            });
        }
    }
    isCorrectOrder(matcher, pair) {
        return this.getCorrectOrder(matcher, [
            pair.amountAsset,
            pair.priceAsset,
        ]).map(p => p.amountAsset === pair.amountAsset);
    }
}
exports.PairOrderingServiceImpl = PairOrderingServiceImpl;
//# sourceMappingURL=index.js.map