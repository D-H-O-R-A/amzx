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
const { parseDate } = require('../../../../utils/parseDate');
const { serialize } = require('../../_common/cursor');
const TIMEOUT = 10000;
const get = (service, txId) => describe('get', () => {
    it('fetches real tx', (done) => __awaiter(void 0, void 0, void 0, function* () {
        service
            .get(txId)
            .run()
            .promise()
            .then(x => {
            expect(x.unsafeGet()).toMatchSnapshot();
            done();
        })
            .catch(e => done(JSON.stringify(e)));
    }), TIMEOUT);
    it('returns null for unreal tx', () => __awaiter(void 0, void 0, void 0, function* () {
        const tx = yield service
            .get('UNREAL')
            .run()
            .promise();
        expect(tx).toBeNothing();
    }), TIMEOUT);
});
const mget = (service, txIds) => describe('mget', () => {
    it('fetches real txs with nulls for unreal', (done) => __awaiter(void 0, void 0, void 0, function* () {
        service
            .mget([...txIds, 'UNREAL'])
            .run()
            .promise()
            .then(xs => {
            expect(xs).toMatchSnapshot();
            done();
        })
            .catch(e => done(JSON.stringify(e)));
    }), TIMEOUT);
});
const search = service => describe('search', () => {
    describe('just', () => {
        it('fetches real txs', () => __awaiter(void 0, void 0, void 0, function* () {
            const tx = yield service
                .search({ limit: 20, sort: 'asc' })
                .run()
                .promise();
            expect(tx).toBeDefined();
            expect(tx.data).toHaveLength(20);
        }), TIMEOUT);
    });
    describe('Pagination ', () => {
        const LIMIT = 21;
        const createCursor = sort => ({ data }) => serialize({
            sort,
            id: data.id,
            timestamp: new Date(data.timestamp),
        });
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
        }), TIMEOUT);
        it('works asc', () => __awaiter(void 0, void 0, void 0, function* () {
            const SORT = 'asc';
            const baseParams = {
                limit: LIMIT,
                sort: SORT,
            };
            const fetchAndGetNextCursor = cursor => service
                .search(Object.assign(Object.assign({}, baseParams), { limit: 5, after: cursor }))
                .run()
                .promise()
                .then(x => [x.lastCursor, x.data.map(createCursor(SORT))]);
            const firstCursor = yield service
                .search(Object.assign(Object.assign({}, baseParams), { limit: 1 }))
                .run()
                .promise()
                .then(x => x.data.map(createCursor(SORT))[0]);
            var i = 0;
            var cursors = [firstCursor];
            var curCursor = firstCursor;
            while (i++ < (LIMIT - 1) / 5) {
                var [nextCursor, cs] = yield fetchAndGetNextCursor(curCursor);
                curCursor = nextCursor;
                cursors = [...cursors, ...cs];
            }
            const expectedCursors = yield service
                .search(Object.assign(Object.assign({}, baseParams), { limit: LIMIT }))
                .run()
                .promise()
                .then(x => x.data.map(createCursor(SORT)));
            expect(cursors).toEqual(expectedCursors);
        }), TIMEOUT);
        it('works desc', () => __awaiter(void 0, void 0, void 0, function* () {
            const SORT = 'desc';
            const baseParams = {
                timeEnd: new Date('2018-12-01'),
                limit: LIMIT,
                sort: SORT,
            };
            const fetchAndGetNextCursor = cursor => service
                .search(Object.assign(Object.assign({}, baseParams), { limit: 5, after: cursor }))
                .run()
                .promise()
                .then(x => [x.lastCursor, x.data.map(createCursor(SORT))]);
            const firstCursor = yield service
                .search(Object.assign(Object.assign({}, baseParams), { limit: 1 }))
                .run()
                .promise()
                .then(x => x.data.map(createCursor(SORT))[0]);
            var i = 0;
            var cursors = [firstCursor];
            var curCursor = firstCursor;
            while (i++ < (LIMIT - 1) / 5) {
                var [nextCursor, curCursors] = yield fetchAndGetNextCursor(curCursor);
                curCursor = nextCursor;
                cursors = [...cursors, ...curCursors];
            }
            const expectedCursors = yield service
                .search(Object.assign(Object.assign({}, baseParams), { limit: LIMIT }))
                .run()
                .promise()
                .then(x => x.data.map(createCursor(SORT)));
            expect(cursors).toEqual(expectedCursors);
        }), TIMEOUT);
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
            .catch(e => done(JSON.stringify(e, null, 2))), TIMEOUT);
    });
});
module.exports = {
    get,
    mget,
    search,
};
//# sourceMappingURL=presets.js.map