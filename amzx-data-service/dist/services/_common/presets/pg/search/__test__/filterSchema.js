"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../../../../../utils/validation");
const DATE0 = new Date(0);
exports.default = (deserialize) => validation_1.Joi.object().keys({
    timeStart: validation_1.Joi.date().min(DATE0),
    timeEnd: validation_1.Joi.when('timeStart', {
        is: validation_1.Joi.exist(),
        then: validation_1.Joi.date().min(validation_1.Joi.ref('timeStart')),
        otherwise: validation_1.Joi.date().min(DATE0),
    }),
    sort: validation_1.Joi.string().valid('asc', 'desc'),
    limit: validation_1.Joi.number()
        .min(1)
        .max(100)
        .required(),
    after: validation_1.Joi.cursor().valid(deserialize),
});
//# sourceMappingURL=filterSchema.js.map