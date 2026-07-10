"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const truncateTable_1 = require("../truncateTable");
describe('pairs daemon sql test', () => {
    it('truncate table', () => {
        expect(truncateTable_1.truncateTable('pairs')).toMatchSnapshot();
    });
});
//# sourceMappingURL=truncateTable.test.js.map