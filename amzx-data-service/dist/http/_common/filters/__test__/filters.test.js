"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const __1 = require("..");
const _common_1 = require("../../../../services/_common");
describe('Filter values parsing', () => {
    const parseQuery = __1.parseFilterValues({});
    const query = {
        ids: ['id1', 'id2'],
        timeStart: '2018-01-01',
        timeEnd: '2018-10-01',
        limit: '10',
        sort: _common_1.SortOrder.Ascending,
        after: 'AFTER',
    };
    describe('all common filter', () => {
        it('values are parsed correctly provided correct values are given', () => {
            expect(parseQuery(query)).toEqual(result_1.Ok(Object.assign(Object.assign({}, query), { timeStart: new Date(query.timeStart), timeEnd: new Date(query.timeEnd), limit: 10 })));
        });
        it('correct default values are given ', () => {
            expect(parseQuery({})).toEqual(result_1.Ok({}));
        });
        it('ids are parsed correctly in any form', () => {
            expect(parseQuery({ ids: 'someValue' })).toEqual(result_1.Ok({
                ids: ['someValue'],
            }));
            expect(parseQuery({ ids: '' })).toEqual(result_1.Ok({
                ids: [],
            }));
            expect(parseQuery({ ids: 'qwe,asd' })).toEqual(result_1.Ok({
                ids: ['qwe', 'asd'],
            }));
        });
    });
    it('extra input values are ignored', () => {
        expect(parseQuery({ badKey: 'badValue' })).toEqual(result_1.Ok({}));
    });
});
//# sourceMappingURL=filters.test.js.map