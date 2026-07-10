"use strict";
const sql = require('../sql');
const filterValues = {
    recipient: 'recipient',
    assetId: 'someAssetID',
};
test('Sql search supports type-specific filters', () => {
    expect(sql.search(filterValues)).toMatchSnapshot();
});
//# sourceMappingURL=sql.test.js.map