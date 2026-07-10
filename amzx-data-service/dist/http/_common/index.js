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
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../errorHandling");
const fp_1 = require("../../utils/fp");
const handleError_1 = require("../_common/handleError");
const utils_1 = require("./utils");
function createHttpHandler(getResponse, parseRequest) {
    return (ctx) => __awaiter(this, void 0, void 0, function* () {
        ctx.eventBus.emit('ENDPOINT_HIT', {
            value: ctx.originalUrl,
        });
        const setResponse = utils_1.setHttpResponse(ctx);
        const safeParse = parseRequest || (() => result_1.Ok());
        try {
            yield fp_1.resultToTask(safeParse({
                params: ctx.params,
                query: ctx.query,
                headers: ctx.headers,
            }).chain((req) => utils_1.parseMoneyFormat(ctx.headers).map((dec) => (Object.assign(Object.assign({}, req), { moneyFormat: dec })))))
                .chain((req) => fp_1.resultToTask(utils_1.parseLSNFormat(ctx.headers)).chain((lsnFormat) => getResponse(req, lsnFormat).map((res) => ({
                request: req,
                response: res,
            }))))
                .mapRejected((e) => {
                ctx.eventBus.emit('ERROR', e);
                return handleError_1.handleError(e);
            })
                .run()
                .promise()
                .then((dto) => setResponse(dto.response.withHeaders({
                'Content-Type': typeof dto.response.headers !== 'undefined' &&
                    dto.response.headers['Content-Type'] !== 'undefined'
                    ? utils_1.contentTypeWithMoneyFormat(dto.request.moneyFormat, dto.response.headers['Content-Type'])
                    : utils_1.contentTypeWithMoneyFormat(dto.request.moneyFormat),
            })))
                .catch(setResponse);
        }
        catch (e) {
            const err = new errorHandling_1.ResolverError(e);
            ctx.eventBus.emit('ERROR', err);
            setResponse(handleError_1.handleError(err));
        }
        ctx.eventBus.emit('ENDPOINT_RESOLVED', {
            value: ctx.body,
        });
    });
}
exports.createHttpHandler = createHttpHandler;
//# sourceMappingURL=index.js.map