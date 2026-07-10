"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign({}, commonFieldsSchemas_1.default), { asset_id: validation_1.Joi.string().assetId().required(), attachment: validation_1.Joi.string().required().allow(''), transfers: validation_1.Joi.array().items({
        recipient: validation_1.Joi.string().allow(null),
        amount: validation_1.Joi.object().bignumber().required(),
    }) }));
//# sourceMappingURL=schema.js.map