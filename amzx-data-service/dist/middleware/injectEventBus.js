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
const { pick, curryN } = require('ramda');
const collectRequestData = ctx => (Object.assign(Object.assign({}, pick(['headers', 'httpVersion', 'method', 'url'])(ctx.request)), { requestId: ctx.state.id, headers: Object.entries(ctx.request.headers)
        .map(h => h.join(':'))
        .join(';') }));
module.exports = eventBus => (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Add request info to all logs
    const request = collectRequestData(ctx);
    const emit = curryN(2, (message, data) => eventBus.emit('log', { message, request, data }));
    ctx.eventBus = { emit };
    yield next();
});
//# sourceMappingURL=injectEventBus.js.map