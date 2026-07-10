"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { performance } = require('perf_hooks');
const accessLogMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const start = performance.now();
    ctx.eventBus.emit('REQUEST', { level: 'info' });
    yield next();
    ctx.eventBus.emit('RESPONSE', {
        level: 'info',
        statusCode: ctx.status,
        responseTime: performance.now() - start,
    });
});
module.exports = accessLogMiddleware;
//# sourceMappingURL=accessLog.js.map