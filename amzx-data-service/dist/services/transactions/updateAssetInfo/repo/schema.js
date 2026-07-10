"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign({}, commonFieldsSchemas_1.default), { asset_id: validation_1.Joi.string().assetId().required(), asset_name: validation_1.Joi.string().required(), description: validation_1.Joi.string().required().allow('') }));
//# sourceMappingURL=schema.js.map