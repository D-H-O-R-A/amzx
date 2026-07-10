"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../../utils/validation");
exports.default = (deserialize) => ({
    limit: validation_1.Joi.number()
        .min(1)
        .max(100)
        .required(),
    after: validation_1.Joi.cursor().valid(deserialize),
});
//# sourceMappingURL=commonFilterSchemas.js.map