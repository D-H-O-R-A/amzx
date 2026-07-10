"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign({}, commonFieldsSchemas_1.default), { amount: validation_1.Joi.object()
        .bignumber()
        .required(), asset_id: validation_1.Joi.string()
        .assetId()
        .required(), fee_asset: validation_1.Joi.string()
        .assetId()
        .required(), attachment: validation_1.Joi.string()
        .required()
        .allow(''), recipient: validation_1.Joi.string().required() }));
//# sourceMappingURL=schema.js.map