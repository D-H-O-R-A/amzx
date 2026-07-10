"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("../pg/sql");
const filterValues = [
    {
        dapp: '3N92gNUHh6jnZmZtdgECTm3cNAZb1Zei6Ve',
    },
    {
        function: 'deposit',
    },
    {
        dapp: 'b3N92gNUHh6jnZmZtdgECTm3cNAZb1Zei6Ve',
        function: 'deposit',
    },
];
describe('Sql search by type-specific filters', () => {
    it('supports dapp filter', () => {
        expect(sql_1.default.search(filterValues[0])).toMatchSnapshot();
    });
    it('supports function filter', () => {
        expect(sql_1.default.search(filterValues[1])).toMatchSnapshot();
    });
    it('supports dapp and function filters', () => {
        expect(sql_1.default.search(filterValues[2])).toMatchSnapshot();
    });
});
//# sourceMappingURL=sql.test.js.map