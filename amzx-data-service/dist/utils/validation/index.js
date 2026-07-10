"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JoiRaw = require("./joi");
const result_1 = require("folktale/result");
exports.validate = (schema, errorFactory, value) => {
    const { error } = JoiRaw.validate(value, schema, { convert: false });
    return error
        ? result_1.Error(errorFactory(error, value))
        : result_1.Ok(value);
};
exports.Joi = JoiRaw;
//# sourceMappingURL=index.js.map