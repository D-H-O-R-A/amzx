"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
const CORRECT_TYPE = validation_1.Joi.string().valid([
    'integer',
    'boolean',
    'string',
    'binary',
    null
]);
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign({}, commonFieldsSchemas_1.default), { data: validation_1.Joi.array()
        .items(validation_1.Joi.object().keys({
        key: validation_1.Joi.string()
            .allow('')
            .required(),
        type: CORRECT_TYPE.required(),
        value: [
            validation_1.Joi.object()
                .bignumber()
                .int64(),
            validation_1.Joi.string().allow(''),
            validation_1.Joi.boolean(),
        ],
    }))
        .required() }));
//# sourceMappingURL=schema.js.map