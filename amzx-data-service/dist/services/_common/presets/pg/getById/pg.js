"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const errorHandling_1 = require("../../../../../errorHandling");
exports.getData = ({ name, sql, pg, }) => (id) => pg
    .oneOrNone(sql(id))
    .map(maybe_1.fromNullable)
    .mapRejected(errorHandling_1.addMeta({ request: name, params: { id } }));
//# sourceMappingURL=pg.js.map