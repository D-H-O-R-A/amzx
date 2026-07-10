"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module transforms pg-promise into pg-task
const pgp_1 = require("./pgp");
const task_1 = require("folktale/concurrency/task");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../errorHandling");
const utils_1 = require("./utils");
exports.createPgDriver = (options, connect = pgp_1.pgpConnect) => {
    const driverP = connect({
        host: options.postgresHost,
        port: options.postgresPort,
        database: options.postgresDatabase,
        user: options.postgresUser,
        password: options.postgresPassword,
        max: options.postgresPoolSize,
        statement_timeout: ramda_1.defaultTo(false, options.postgresStatementTimeout),
    });
    const toTasked = (promised) => task_1.fromPromised(promised)().mapRejected(e => utils_1.isStatementTimeoutErrorMessage(e.message)
        ? errorHandling_1.toTimeout({}, e)
        : errorHandling_1.toDbError({}, e));
    const driverT = {
        none: (query, values) => toTasked(() => driverP.none(query, values)),
        one: (query, values) => toTasked(() => driverP.one(query, values)),
        oneOrNone: (query, values) => toTasked(() => driverP.oneOrNone(query, values)),
        many: (query, values) => toTasked(() => driverP.many(query, values)),
        any: (query, values) => toTasked(() => driverP.any(query, values)),
        task: (cb) => toTasked(() => driverP.task(cb)),
        tx: (cb) => toTasked(() => driverP.tx(cb)),
    };
    return driverT;
};
//# sourceMappingURL=pg.js.map