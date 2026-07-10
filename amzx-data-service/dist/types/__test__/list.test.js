"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = require("../list");
const items = [{ id: 'qwe', f: 0 }, { id: 'asd', f: 1 }];
describe('List type should be', () => {
    it('constructed from array', () => {
        expect(list_1.list(items)).toEqual({
            __type: 'list',
            data: items,
        });
    });
    it('adds meta', () => {
        expect(list_1.list(items, { someValue: true })).toEqual({
            __type: 'list',
            data: items,
            someValue: true,
        });
    });
});
//# sourceMappingURL=list.test.js.map