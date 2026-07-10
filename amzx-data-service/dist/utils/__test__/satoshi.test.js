"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_entities_1 = require("@waves/data-entities");
const satoshi_1 = require("../satoshi");
test('convertAmount should multiply by 10^-decimals', () => {
    expect(satoshi_1.convertAmount(8, new data_entities_1.BigNumber(100000000))).toEqual(new data_entities_1.BigNumber(1));
    expect(satoshi_1.convertAmount(2, new data_entities_1.BigNumber(1234))).toEqual(new data_entities_1.BigNumber(12.34));
    expect(satoshi_1.convertAmount(2, new data_entities_1.BigNumber(0))).toEqual(new data_entities_1.BigNumber(0));
    expect(satoshi_1.convertAmount(0, new data_entities_1.BigNumber(1))).toEqual(new data_entities_1.BigNumber(1));
});
test('convertPrice should multiply by 10^-8 + aDecimals - pDecimals', () => {
    expect(satoshi_1.convertPrice(8, 8, new data_entities_1.BigNumber(100000000))).toEqual(new data_entities_1.BigNumber(1));
    expect(satoshi_1.convertPrice(8, 2, new data_entities_1.BigNumber(100))).toEqual(new data_entities_1.BigNumber(1));
    expect(satoshi_1.convertPrice(8, 0, new data_entities_1.BigNumber(100))).toEqual(new data_entities_1.BigNumber(100));
});
test('functions should not fail on corner cases', () => {
    expect(satoshi_1.convertAmount(0, new data_entities_1.BigNumber(NaN))).toEqual(new data_entities_1.BigNumber(NaN));
    expect(satoshi_1.convertAmount(0, new data_entities_1.BigNumber(Infinity))).toEqual(new data_entities_1.BigNumber(Infinity));
    expect(satoshi_1.convertPrice(0, 0, new data_entities_1.BigNumber(NaN))).toEqual(new data_entities_1.BigNumber(NaN));
    expect(satoshi_1.convertPrice(0, 0, new data_entities_1.BigNumber(Infinity))).toEqual(new data_entities_1.BigNumber(Infinity));
});
//# sourceMappingURL=satoshi.test.js.map