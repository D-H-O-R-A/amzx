"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandling_1 = require("../../../errorHandling");
const validation_1 = require("../../../utils/validation");
const fp_1 = require("../../../utils/fp");
exports.validateInput = (schema, name) => (value) => fp_1.resultToTask(validation_1.validate(schema, (error, value) => errorHandling_1.AppError.Validation('Input validation failed', {
    resolver: name,
    error,
    value,
}), value));
exports.validateResult = (schema, name) => (value) => validation_1.validate(schema, (error, value) => errorHandling_1.AppError.Resolver('Result validation failed', {
    resolver: name,
    value,
    error,
}), value);
//# sourceMappingURL=validation.js.map