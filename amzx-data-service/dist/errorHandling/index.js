"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const factories_1 = require("./factories");
__export(require("./AppError"));
__export(require("./factories"));
exports.DEFAULT_INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Server Error';
exports.DEFAULT_TIMEOUT_OCCURRED_MESSAGE = 'A Timeout Occurred';
exports.DEFAULT_NOT_FOUND_MESSAGE = 'Not Found';
exports.DEFAULT_BAD_REQUEST_MESSAGE = 'Bad Request';
function addMeta(meta) {
    return (e) => factories_1.toAppError(e.type)(meta, e.error);
}
exports.addMeta = addMeta;
//# sourceMappingURL=index.js.map