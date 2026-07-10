"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../utils/validation");
exports.result = validation_1.Joi.object().keys({
    uid: validation_1.Joi.object().bignumber().required(),
    tx_type: validation_1.Joi.number().min(1).max(18).required(),
    time_stamp: validation_1.Joi.date().required(),
    id: validation_1.Joi.string().base58().required(),
});
//# sourceMappingURL=schema.js.map