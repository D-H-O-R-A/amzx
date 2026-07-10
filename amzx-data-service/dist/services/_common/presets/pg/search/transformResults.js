"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const createMeta = (serialize) => (request, responsesRaw) => {
    const metaBuilder = {
        isLastPage: true,
    };
    const lastResponse = ramda_1.last(ramda_1.init(responsesRaw));
    if (typeof lastResponse !== 'undefined') {
        metaBuilder.isLastPage = responsesRaw.length < request.limit;
        metaBuilder.lastCursor = serialize(request, lastResponse);
    }
    return metaBuilder;
};
exports.transformResults = (transformDbResponse, serialize) => (responses, request) => {
    const transformedData = ramda_1.compose(rs => rs.map(r => transformDbResponse(r, request)), ramda_1.take(request.limit))(responses);
    return Object.assign({ items: transformedData }, createMeta(serialize)(request, responses));
};
//# sourceMappingURL=transformResults.js.map