"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_adjunct_1 = require("ramda-adjunct");
const ramda_1 = require("ramda");
const data_entities_1 = require("@waves/data-entities");
exports.transformDbResponse = (raw) => ramda_1.compose((obj) => new data_entities_1.Asset(obj), ramda_adjunct_1.renameKeys({
    asset_id: 'id',
    asset_name: 'name',
    issue_height: 'height',
    issue_timestamp: 'timestamp',
    total_quantity: 'quantity',
    decimals: 'precision',
    has_script: 'hasScript',
    min_sponsored_asset_fee: 'minSponsoredFee',
}))(raw);
//# sourceMappingURL=transformAsset.js.map