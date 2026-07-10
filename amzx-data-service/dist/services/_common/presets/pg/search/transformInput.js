"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
exports.transformInput = (deserialize) => (request) => {
    const requestWithoutAfter = ramda_1.compose(ramda_1.omit(['after']), ramda_1.evolve({ limit: ramda_1.inc }))(request);
    if (!request.after) {
        return result_1.Ok(requestWithoutAfter);
    }
    else {
        return deserialize(request.after).map(cursor => (Object.assign(Object.assign({}, requestWithoutAfter), { after: cursor })));
    }
};
//# sourceMappingURL=transformInput.js.map