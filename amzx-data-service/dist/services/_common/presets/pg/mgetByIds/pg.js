"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const db_1 = require("../../../../../utils/db");
const errorHandling_1 = require("../../../../../errorHandling");
const ramda_1 = require("ramda");
exports.getData = ({ matchRequestResult, name, sql, pg, }) => (req) => ramda_1.isEmpty(req)
    ? task_1.of([])
    : pg
        .any(sql(req))
        .map(responses => db_1.matchRequestsResults(matchRequestResult, req, responses))
        .mapRejected(errorHandling_1.addMeta({ request: name, params: req }));
//# sourceMappingURL=pg.js.map