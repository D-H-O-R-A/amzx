"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const validation_1 = require("../../../../utils/validation");
const commonFieldsSchemas_1 = require("../../_common/commonFieldsSchemas");
exports.result = validation_1.Joi.object().keys(Object.assign(Object.assign({}, ramda_1.omit(['sender', 'sender_public_key'], commonFieldsSchemas_1.default)), { amount: validation_1.Joi.object()
        .bignumber()
        .required(), recipient: validation_1.Joi.string().required() }));
//# sourceMappingURL=schema.js.map