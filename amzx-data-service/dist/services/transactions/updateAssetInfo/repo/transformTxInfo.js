"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const ramda_adjunct_1 = require("ramda-adjunct");
const transformTxInfo_1 = require("../../_common/transformTxInfo");
exports.default = ramda_1.compose(transformTxInfo_1.transformTxInfo, ramda_adjunct_1.renameKeys({
    asset_name: 'name',
    asset_id: 'assetId',
}));
//# sourceMappingURL=transformTxInfo.js.map