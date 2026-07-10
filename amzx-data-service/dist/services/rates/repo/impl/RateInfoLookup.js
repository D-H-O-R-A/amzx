"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const ramda_1 = require("ramda");
const data_entities_1 = require("@waves/data-entities");
const data_1 = require("../../data");
const util_1 = require("../../util");
const maybeOps_1 = require("../../../../utils/fp/maybeOps");
const types_1 = require("../../../../services/types");
/*
   find rate data from RateLookupTable using the following strategy:
   
   lookup(amountAsset, priceAsset) || ( lookup(amountAsset, baseAsset) / lookup(priceAsset, baseAsset) }
   
   where lookup = getFromTable(asset1, asset2) || 1 / getFromtable(asset2, asset1)
*/
class RateInfoLookup {
    constructor(data, mPairAcceptanceVolumeThreshold, baseAsset) {
        this.mPairAcceptanceVolumeThreshold = mPairAcceptanceVolumeThreshold;
        this.baseAsset = baseAsset;
        this.lookupTable = this.toLookupTable(data);
    }
    has(pairWithMoneyFormat) {
        return maybeOps_1.isDefined(this.get(pairWithMoneyFormat));
    }
    get(pairWithMoneyFormat) {
        const pairHasBaseAsset = data_1.createPairHasBaseAsset(this.baseAsset.id);
        const lookup = (pair, flipped) => this.getFromLookupTable(pair, flipped, pairWithMoneyFormat.moneyFormat);
        if (pairHasBaseAsset(pairWithMoneyFormat)) {
            return lookup(pairWithMoneyFormat, false).orElse(() => lookup(pairWithMoneyFormat, true));
        }
        let baseAssetPaired = this.lookupThroughBaseAsset(this.baseAsset, pairWithMoneyFormat);
        let hasPairWithBaseAsset = baseAssetPaired.matchWith({
            Just: () => true,
            Nothing: () => false,
        });
        return lookup(pairWithMoneyFormat, false)
            .orElse(() => lookup(pairWithMoneyFormat, true))
            .filter((val) => (val.volumeWaves !== null &&
            this.mPairAcceptanceVolumeThreshold.matchWith({
                Just: ({ value: pairAcceptanceVolumeThreshold }) => val.volumeWaves.gte(pairAcceptanceVolumeThreshold),
                // lookup through waves
                Nothing: () => false,
            })) ||
            !hasPairWithBaseAsset)
            .orElse(() => baseAssetPaired);
    }
    toLookupTable(data) {
        return data.reduce((acc, item) => {
            if (!(item.amountAsset.id in acc)) {
                acc[item.amountAsset.id] = {};
            }
            acc[item.amountAsset.id][item.priceAsset.id] = item;
            return acc;
        }, {});
    }
    // Returns rate for requested pair
    // If `flipped`, then it has to search for flipped assets pair,
    // but has to response for requested pair
    getFromLookupTable(pair, flipped, moneyFormat) {
        // src: A/B
        const lookupData = flipped ? data_1.flip(pair) : pair;
        // lookup for: flipped ? B/A : A/B
        let foundValue = maybe_1.fromNullable(ramda_1.path([lookupData.amountAsset.id, lookupData.priceAsset.id], this.lookupTable));
        return foundValue.map((data) => {
            if (flipped) {
                // found for: B/A
                let flippedData = data_1.flip(Object.assign({}, data));
                // result for: A/B (src),
                // otherwise 1/rate will be cached for rate B/A, but it incorrect
                if (moneyFormat === types_1.MoneyFormat.Long) {
                    flippedData.rate = util_1.invOnSatoshi(flippedData.rate, 8)
                        .map((r) => r.shiftedBy(8))
                        .getOrElse(new data_entities_1.BigNumber(0));
                }
                else {
                    flippedData.rate = util_1.inv(flippedData.rate).getOrElse(new data_entities_1.BigNumber(0));
                }
                return flippedData;
            }
            else {
                return data;
            }
        });
    }
    lookupThroughBaseAsset(baseAsset, pair) {
        return maybeOps_1.map2((info1, info2) => (Object.assign(Object.assign({}, pair), { rate: util_1.safeDivide(info1.rate, info2.rate)
                .map((r) => pair.moneyFormat === types_1.MoneyFormat.Long ? r.shiftedBy(8).decimalPlaces(0) : r)
                .getOrElse(new data_entities_1.BigNumber(0)), volumeWaves: data_entities_1.BigNumber.max(info1.volumeWaves, info2.volumeWaves) })), this.get({
            amountAsset: pair.amountAsset,
            priceAsset: baseAsset,
            moneyFormat: pair.moneyFormat,
        }), this.get({
            amountAsset: pair.priceAsset,
            priceAsset: baseAsset,
            moneyFormat: pair.moneyFormat,
        }));
    }
}
exports.default = RateInfoLookup;
//# sourceMappingURL=RateInfoLookup.js.map