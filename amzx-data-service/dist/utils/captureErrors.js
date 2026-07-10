"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandling_1 = require("../errorHandling");
const isAppError = (error) => error && typeof error.matchWith === 'function';
exports.captureErrors = (errorHandler) => (middleware) => (ctx, next) => middleware(ctx, next).catch((error) => {
    if (isAppError(error))
        return errorHandler({ ctx, error });
    ctx.status = 500;
    ctx.body = {
        message: errorHandling_1.DEFAULT_INTERNAL_SERVER_ERROR_MESSAGE,
    };
    ctx.eventBus.emit('ERROR', {
        error: error,
        type: 'UnhandledError',
    });
});
//# sourceMappingURL=captureErrors.js.map