"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const pairs_1 = require("../pairs");
const PairOrderingService_1 = require("../../../PairOrderingService");
const task_1 = require("folktale/concurrency/task");
describe('Pairs validation', () => {
    const MATCHER = 'matcher';
    const WAVES = 'WAVES';
    const BTC = 'BTC';
    const pairOrderingService = new PairOrderingService_1.PairOrderingServiceImpl({
        [MATCHER]: [BTC, WAVES],
    });
    const assetsMget = ({ ids }) => task_1.of(ids.map(aid => {
        switch (aid) {
            case BTC:
            case WAVES:
                return maybe_1.of({});
            default:
                return maybe_1.empty();
        }
    }));
    const validate = pairs_1.validatePairs(assetsMget, pairOrderingService);
    describe('asset order validation', () => {
        it('known matcher, right order, pass', () => expect(validate(MATCHER, [{ amountAsset: WAVES, priceAsset: BTC }])
            .run()
            .promise()).resolves.not.toThrow());
        it('unknown matcher, existing assets, pass', () => expect(validate('', [{ amountAsset: WAVES, priceAsset: BTC }])
            .run()
            .promise()).resolves.not.toThrow());
        it('known matcher, wrong order, fail', () => expect(validate(MATCHER, [{ amountAsset: BTC, priceAsset: WAVES }])
            .run()
            .promise()).rejects.toMatchSnapshot());
    });
    describe('assets existence validation', () => {
        it('non-existing assets, right order, fail', () => expect(validate(MATCHER, [{ amountAsset: 'ASSET1', priceAsset: BTC }])
            .run()
            .promise()).rejects.toMatchSnapshot());
        it('non-existing assets, wrong order, fail with ordering error', () => expect(validate(MATCHER, [{ amountAsset: 'ASSET1', priceAsset: 'ASSET2' }])
            .run()
            .promise()).rejects.toMatchSnapshot());
    });
});
//# sourceMappingURL=pairs.test.js.map