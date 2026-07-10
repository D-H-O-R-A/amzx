"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = require("./AppError");
const ramda_1 = require("ramda");
exports.toAppError = ramda_1.curryN(3, (type, meta, err) => AppError_1.AppError[type](err, meta));
exports.toInitError = exports.toAppError('Init');
exports.toResolverError = exports.toAppError('Resolver');
exports.toDbError = exports.toAppError('Db');
exports.toValidationError = exports.toAppError('Validation');
exports.toParseError = exports.toAppError('Parse');
exports.toTimeout = exports.toAppError('Timeout');
//# sourceMappingURL=factories.js.map