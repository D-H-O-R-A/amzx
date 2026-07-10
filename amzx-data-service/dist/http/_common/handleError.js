"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const isJoiValidationError = (errMeta) => typeof errMeta !== 'undefined' && Array.isArray(errMeta.details);
exports.handleError = (error) => {
    return error.matchWith({
        Init: () => types_1.HttpResponse.InternalServerError(),
        Db: () => types_1.HttpResponse.InternalServerError(),
        Resolver: () => types_1.HttpResponse.InternalServerError(),
        Parse: errorInfo => types_1.HttpResponse.BadRequest([
            Object.assign({ message: errorInfo.error.message }, errorInfo.meta),
        ]),
        Validation: errorInfo => {
            const errorInfoMeta = errorInfo.meta;
            if (isJoiValidationError(errorInfoMeta)) {
                return types_1.HttpResponse.BadRequest(errorInfoMeta.details.map(error => ({
                    message: error.message,
                })));
            }
            else if (errorInfoMeta !== undefined) {
                return types_1.HttpResponse.BadRequest([
                    Object.assign({ message: errorInfo.error.message }, errorInfoMeta),
                ]);
            }
            else {
                return types_1.HttpResponse.BadRequest();
            }
        },
        Timeout: () => types_1.HttpResponse.TimeoutOccured(),
    });
};
//# sourceMappingURL=handleError.js.map