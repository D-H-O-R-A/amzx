"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_entities_1 = require("@waves/data-entities");
const maybe_1 = require("folktale/maybe");
const types_1 = require("../../../../types");
const RateInfoLookup_1 = require("../RateInfoLookup");
describe('RateInfoLookup', () => {
    describe('get', () => {
        it('should get rate exactly for requested pair', () => {
            var _a, _b;
            const amountAsset = new data_entities_1.Asset({
                id: 'WAVES',
                name: 'Waves',
                description: '',
                precision: 8,
                height: 0,
                timestamp: new Date(),
                sender: '',
                quantity: 100,
                reissuable: false,
                minSponsoredFee: 0,
                hasScript: false,
            });
            const baseAsset = new data_entities_1.Asset({
                id: 'USDN',
                name: 'USDN',
                description: '',
                precision: 6,
                height: 1,
                timestamp: new Date(),
                sender: '',
                quantity: 100,
                reissuable: false,
                minSponsoredFee: 0,
                hasScript: false,
            });
            const data = [
                {
                    amountAsset: amountAsset,
                    priceAsset: baseAsset,
                    rate: new data_entities_1.BigNumber(10),
                    volumeWaves: new data_entities_1.BigNumber(100),
                },
            ];
            const lookup = new RateInfoLookup_1.default(data, maybe_1.empty(), baseAsset);
            const request = {
                amountAsset: baseAsset,
                priceAsset: amountAsset,
                moneyFormat: types_1.MoneyFormat.Long,
            };
            const rate = lookup.get(request).getOrElse(undefined);
            expect(rate).toBeDefined();
            expect((_a = rate) === null || _a === void 0 ? void 0 : _a.amountAsset.id).toEqual(request.amountAsset.id);
            expect((_b = rate) === null || _b === void 0 ? void 0 : _b.priceAsset.id).toEqual(request.priceAsset.id);
        });
    });
});
//# sourceMappingURL=RateInfoLookup.test.js.map