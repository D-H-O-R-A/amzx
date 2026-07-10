"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fillTable_1 = require("../fillTable");
describe('pairs daemon sql test', () => {
    it('fill table', () => {
        expect(fillTable_1.fillTable('pairs')).toMatchSnapshot();
    });
});
//# sourceMappingURL=fillTable.test.js.map