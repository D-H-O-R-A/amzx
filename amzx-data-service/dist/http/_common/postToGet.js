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
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = require("qs");
exports.postToGet = routeMiddleware => (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.method = 'GET';
    // @hack, can't rely on koa-qs in this one
    // Need to explicitly call with { indices: false }
    // Otherwise your array with >20 elems [0..21] will become { 0: 0, 1: 1, ... 21: 21 }
    ctx.request.querystring = qs_1.stringify(ctx.request.body, { indices: false });
    yield routeMiddleware(ctx, next);
    next();
});
//# sourceMappingURL=postToGet.js.map