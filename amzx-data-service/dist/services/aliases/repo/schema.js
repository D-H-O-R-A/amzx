"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("../../../utils/validation/joi");
exports.output = Joi.object().keys({
    address: Joi.string()
        .base58()
        .required()
        .allow(null),
    alias: Joi.string().required(),
    duplicates: Joi.object().bignumber(),
});
//# sourceMappingURL=schema.js.map