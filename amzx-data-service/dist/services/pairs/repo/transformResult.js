"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_adjunct_1 = require("ramda-adjunct");
/** renamePairFields :: Object -> Object */
const renamePairFields = ramda_adjunct_1.renameKeys({
    amount_asset_id: 'amountAsset',
    price_asset_id: 'priceAsset',
    first_price: 'firstPrice',
    last_price: 'lastPrice',
    volume_waves: 'volumeWaves',
    weighted_average_price: 'weightedAveragePrice',
    quote_volume: 'quoteVolume',
    txs_count: 'txsCount',
});
/** transformResult :: Object -> Object */
exports.transformResult = renamePairFields;
//# sourceMappingURL=transformResult.js.map