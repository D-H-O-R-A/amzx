"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandling_1 = require("../../../../../errorHandling");
exports.getData = ({ name, sql, pg, }) => (request) => pg
    .any(sql(request))
    .mapRejected(errorHandling_1.addMeta({ request: name, params: request }));
//# sourceMappingURL=pg.js.map