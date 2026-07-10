"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { prop, and, equals } = require('ramda');
/** matchPairs :: (Object, Object) -> Boolean */
exports.matchRequestResult = (request, result) => and(equals(prop('amount_asset_id', result), prop('amountAsset', request)), equals(prop('price_asset_id', result), prop('priceAsset', request)));
//# sourceMappingURL=matchRequestResult.js.map