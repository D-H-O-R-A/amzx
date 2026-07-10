"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../utils/validation");
exports.default = {
    uid: validation_1.Joi.object().bignumber().required(),
    id: validation_1.Joi.string().base58().required(),
    height: validation_1.Joi.number().required(),
    tx_type: validation_1.Joi.number().min(1).max(18).required(),
    tx_version: validation_1.Joi.number().required().allow(null),
    fee: validation_1.Joi.object().bignumber().required(),
    time_stamp: validation_1.Joi.date().required(),
    signature: validation_1.Joi.string().base58().required().allow(null),
    proofs: validation_1.Joi.array().required(),
    status: validation_1.Joi.string().required(),
    sender: validation_1.Joi.string().base58().required(),
    sender_public_key: validation_1.Joi.string().base58().required(),
};
//# sourceMappingURL=commonFieldsSchemas.js.map