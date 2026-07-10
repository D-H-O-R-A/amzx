"use strict";
const sql = require('../sql');
const filterValues = {
    recipient: 'recipient',
};
describe('Sql search by type-specific filters', () => {
    it('supports recipient filter', () => {
        expect(sql.search(filterValues)).toMatchSnapshot();
    });
});
//# sourceMappingURL=sql.test.js.map