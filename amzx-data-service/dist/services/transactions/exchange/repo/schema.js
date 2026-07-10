"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
const types_1 = require("./types");
const orderTypes = (prefix) => ({
    [`${prefix}_id`]: validation_1.Joi.string()
        .base58()
        .required(),
    [`${prefix}_version`]: validation_1.Joi.string()
        .noNullChars()
        .required()
        .allow(null),
    [`${prefix}_type`]: validation_1.Joi.string()
        .valid(types_1.OrderType.Buy, types_1.OrderType.Sell)
        .required(),
    [`${prefix}_sender`]: validation_1.Joi.string()
        .base58()
        .required(),
    [`${prefix}_sender_public_key`]: validation_1.Joi.string()
        .base58()
        .required(),
    [`${prefix}_signature`]: validation_1.Joi.string()
        .base58()
        .required()
        .allow(""),
    [`${prefix}_matcher_fee`]: validation_1.Joi.object()
        .bignumber()
        .required(),
    [`${prefix}_price`]: validation_1.Joi.object()
        .bignumber()
        .required(),
    [`${prefix}_amount`]: validation_1.Joi.object()
        .bignumber()
        .required(),
    [`${prefix}_time_stamp`]: validation_1.Joi.object()
        .type(Date)
        .required(),
    [`${prefix}_expiration`]: validation_1.Joi.object()
        .type(Date)
        .required(),
    [`${prefix}_matcher_fee_asset_id`]: validation_1.Joi.string()
        .assetId()
        .allow(null),
    [`${prefix}_eip712signature`]: validation_1.Joi.string()
        .eip712Signature()
        .allow(null),
    [`${prefix}_price_mode`]: validation_1.Joi.string()
        .valid(types_1.OrderPriceMode.AssetDecimals, types_1.OrderPriceMode.FixedDecimals)
        .allow(null),
});
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign(Object.assign(Object.assign({}, commonFieldsSchemas_1.default), { price_asset: validation_1.Joi.string()
        .assetId()
        .required(), amount_asset: validation_1.Joi.string()
        .assetId()
        .required(), price: validation_1.Joi.object()
        .bignumber()
        .required(), amount: validation_1.Joi.object()
        .bignumber()
        .required(), buy_matcher_fee: validation_1.Joi.object()
        .bignumber()
        .required(), sell_matcher_fee: validation_1.Joi.object()
        .bignumber()
        .required() }), orderTypes('o1')), orderTypes('o2')));
//# sourceMappingURL=schema.js.map