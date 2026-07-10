"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign({}, commonFieldsSchemas_1.default), { fee_asset_id: validation_1.Joi.string().required(), dapp: validation_1.Joi.string().required(), call: validation_1.Joi.object()
        .keys({
        function: validation_1.Joi.string().noNullChars(),
        args: validation_1.Joi.array().items({
            type: validation_1.Joi.string(),
            value: validation_1.Joi.any(),
        }),
    })
        .allow(null), payment: validation_1.Joi.array().items({
        amount: validation_1.Joi.object()
            .bignumber()
            .required(),
        assetId: validation_1.Joi.string()
            .assetId()
            .required()
            .allow(null),
    }) }));
//# sourceMappingURL=schema.js.map