"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../utils/db");
const errorHandling_1 = require("../../../errorHandling");
exports.mgetPairsPg = ({ matchRequestResult, name, sql, pg, }) => (request) => pg
    .any(sql(request))
    .map(responses => db_1.matchRequestsResults(matchRequestResult, request.pairs, responses))
    .mapRejected(errorHandling_1.addMeta({ request: name, params: request }));
//# sourceMappingURL=mgetPairsPg.js.map