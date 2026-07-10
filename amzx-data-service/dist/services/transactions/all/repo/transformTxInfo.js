"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_adjunct_1 = require("ramda-adjunct");
exports.transformTxInfo = ramda_adjunct_1.renameKeys({
    uid: 'txUid',
    tx_type: 'type',
    time_stamp: 'timestamp',
});
//# sourceMappingURL=transformTxInfo.js.map