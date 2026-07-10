"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const createService = require('../../genesis').default;
const { createPgDriver } = require('../../../../../db');
const { parseDate } = require('../../../../../utils/parseDate');
const { serialize } = require('../../../_common/cursor');
const { loadConfig } = require('../../../../../loadConfig');
const options = loadConfig();
const drivers = {
    pg: createPgDriver(options),
};
const service = createService({
    drivers,
    emitEvent: () => () => null,
});
describe('Genesis transaction service', () => {
    describe('search', () => {
        it('fetches all 6 genesis txs', () => __awaiter(void 0, void 0, void 0, function* () {
            const tx = yield service
                .search({ limit: 20, sort: 'asc' })
                .run()
                .promise();
            expect(tx).toBeDefined();
            expect(tx.data).toHaveLength(6);
        }), 10000);
        describe('Pagination ', () => {
            const createCursor = sort => ({ id, timestamp }) => serialize({ sort, id, timestamp });
            it('doesnt get 2 identical entries for limit 1 asc with next page fetching', () => __awaiter(void 0, void 0, void 0, function* () {
                const baseParams = {
                    limit: 1,
                    sort: 'asc',
                };
                const firstTx = yield service
                    .search(baseParams)
                    .run()
                    .promise();
                const secondTx = yield service
                    .search({
                    after: firstTx.lastCursor,
                    limit: 1,
                })
                    .run()
                    .promise();
                expect(firstTx.data).not.toEqual(secondTx.data);
            }));
            const assertPagination = (sort) => __awaiter(void 0, void 0, void 0, function* () {
                const LIMIT = 3;
                const firstThree = yield service
                    .search({
                    limit: LIMIT,
                    sort,
                })
                    .run()
                    .promise();
                const secondThree = yield service
                    .search({
                    limit: LIMIT,
                    sort,
                    after: createCursor(sort)(firstThree.data[2].data),
                })
                    .run()
                    .promise();
                expect([...firstThree.data, secondThree.data]).toMatchSnapshot();
            });
            it('works asc', () => assertPagination('asc'));
            it('works desc', () => assertPagination('desc'));
            it('doesnt try to create a cursor for empty response', done => service
                .search({
                limit: 1,
                timeEnd: parseDate('1').unsafeGet(),
            })
                .run()
                .promise()
                .then(d => {
                expect(d).not.toHaveProperty('lastCursor');
                done();
            })
                .catch(e => done(JSON.stringify(e, null, 2))));
        });
    });
});
//# sourceMappingURL=transactions.genesis.test.int.js.map