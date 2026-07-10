"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformResults = (transformDbResponse) => (maybeResponses, request) => maybeResponses.map(maybeResponse => maybeResponse.map(res => transformDbResponse(res, request)));
//# sourceMappingURL=transformResult.js.map