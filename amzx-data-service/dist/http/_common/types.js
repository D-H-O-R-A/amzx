"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandling_1 = require("../../errorHandling");
const utils_1 = require("./utils");
const headersWithContentType = {
    'Content-Type': 'application/json; charset=utf-8'
};
class HttpResponse {
    constructor(status, body, headers) {
        this.status = status;
        this.body = body;
        this.headers = headers;
    }
    static Ok(body, headers) {
        return new HttpResponse(200, body, headers);
    }
    static BadRequest(meta, headers) {
        return new HttpResponse(400, utils_1.defaultStringify({
            message: errorHandling_1.DEFAULT_BAD_REQUEST_MESSAGE,
            meta,
        }), Object.assign(Object.assign({}, headersWithContentType), headers));
    }
    static NotFound(headers) {
        return new HttpResponse(404, utils_1.defaultStringify({
            message: errorHandling_1.DEFAULT_NOT_FOUND_MESSAGE,
        }), Object.assign(Object.assign({}, headersWithContentType), headers));
    }
    static InternalServerError(headers) {
        return new HttpResponse(500, utils_1.defaultStringify({
            message: errorHandling_1.DEFAULT_INTERNAL_SERVER_ERROR_MESSAGE,
        }), Object.assign(Object.assign({}, headersWithContentType), headers));
    }
    static TimeoutOccured(headers) {
        return new HttpResponse(504, utils_1.defaultStringify({
            message: errorHandling_1.DEFAULT_TIMEOUT_OCCURRED_MESSAGE,
        }), Object.assign(Object.assign({}, headersWithContentType), headers));
    }
    withHeaders(headers) {
        return new HttpResponse(this.status, this.body, headers);
    }
}
exports.HttpResponse = HttpResponse;
//# sourceMappingURL=types.js.map