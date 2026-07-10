"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interval_1 = require("../../../../../types/interval");
const sql_1 = require("../sql");
describe('sql query from candles', () => {
    it('should search candles for 1h', () => {
        expect(sql_1.sql.search({
            amountAsset: '111',
            priceAsset: '222',
            timeStart: new Date('2017-04-03T00:00:00.000Z'),
            timeEnd: new Date('2017-04-03T23:59:59.999Z'),
            interval: interval_1.interval('1h').unsafeGet(),
            matcher: '123',
        })).toMatchSnapshot();
    });
    it('should search candles for 1d', () => {
        expect(sql_1.sql.search({
            amountAsset: '111',
            priceAsset: '222',
            timeStart: new Date('2017-04-03T00:00:00.000Z'),
            timeEnd: new Date('2017-04-03T23:59:59.999Z'),
            interval: interval_1.interval('1d').unsafeGet(),
            matcher: '123',
        })).toMatchSnapshot();
    });
    it('should search candles for 1m', () => {
        expect(sql_1.sql.search({
            amountAsset: '111',
            priceAsset: '222',
            timeStart: new Date('2017-04-03T00:00:00.000Z'),
            timeEnd: new Date('2017-04-03T23:59:59.999Z'),
            interval: interval_1.interval('1m').unsafeGet(),
            matcher: '123',
        })).toMatchSnapshot();
    });
});
//# sourceMappingURL=sql.test.js.map