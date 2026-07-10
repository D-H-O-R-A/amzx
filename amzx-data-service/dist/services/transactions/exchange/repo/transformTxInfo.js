"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const ramda_adjunct_1 = require("ramda-adjunct");
const transformTxInfo_1 = require("../../_common/transformTxInfo");
const createOrder = (prefix) => ({ [`${prefix}_id`]: id, [`${prefix}_version`]: versionStr, [`${prefix}_sender_public_key`]: senderPublicKey, [`${prefix}_sender`]: sender, [`${prefix}_type`]: orderType, [`${prefix}_price`]: price, [`${prefix}_amount`]: amount, [`${prefix}_time_stamp`]: timestamp, [`${prefix}_expiration`]: expiration, [`${prefix}_signature`]: signature, [`${prefix}_matcher_fee`]: matcherFee, [`${prefix}_matcher_fee_asset_id`]: matcherFeeAssetId, [`${prefix}_price_mode`]: priceMode, [`${prefix}_eip712signature`]: eip712Signature, price_asset: priceAsset, amount_asset: amountAsset, sender_public_key: matcherPublicKey, }) => {
    const version = parseInt(versionStr) || 1;
    const o = {
        id,
        version,
        senderPublicKey,
        matcherPublicKey,
        assetPair: {
            amountAsset,
            priceAsset,
        },
        orderType,
        price,
        sender,
        amount,
        timestamp,
        expiration,
        matcherFee,
        signature,
    };
    if (version > 2)
        o.matcherFeeAssetId = matcherFeeAssetId;
    if (version > 3) {
        o.priceMode = priceMode;
        o.eip712Signature = eip712Signature;
    }
    return o;
};
/** transformTx:: RawTxInfo -> TxInfo */
exports.default = (tx) => {
    const commonFields = ramda_1.compose(transformTxInfo_1.transformTxInfo, ramda_1.pick([
        'id',
        'time_stamp',
        'height',
        'tx_type',
        'tx_version',
        'signature',
        'proofs',
        'fee',
        'status',
        'sender',
        'sender_public_key',
    ]))(tx);
    const exchangeTxFields = ramda_1.compose(ramda_adjunct_1.renameKeys({
        buy_matcher_fee: 'buyMatcherFee',
        sell_matcher_fee: 'sellMatcherFee',
    }), ramda_1.pick(['buy_matcher_fee', 'sell_matcher_fee', 'price', 'amount']))(tx);
    return Object.assign(Object.assign(Object.assign({}, commonFields), exchangeTxFields), { order1: createOrder('o1')(tx), order2: createOrder('o2')(tx) });
};
//# sourceMappingURL=transformTxInfo.js.map