"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign({}, commonFieldsSchemas_1.default), { asset_id: validation_1.Joi.string()
        .base58()
        .required(), min_sponsored_asset_fee: validation_1.Joi.object()
        .bignumber()
        .required()
        .allow(null) }));
//# sourceMappingURL=schema.js.map