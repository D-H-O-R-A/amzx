"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadConfig_1 = require("../../../loadConfig");
const utils_1 = require("../../driver/utils");
const createDb_1 = require("./createDb");
const cfg = loadConfig_1.loadConfig();
describe('Db', () => {
    // run test in case postgresStatementTimoout is set only
    if (typeof cfg.postgresStatementTimeout === 'number') {
        const timeout = cfg.postgresStatementTimeout;
        const db = createDb_1.default();
        it('should throw and recognize timeout error', (done) => {
            db.none('select pg_sleep($1);', timeout / 1000 + 1) // timeout (in ms) + 1s
                .run()
                .listen({
                onResolved: () => done.fail('Error was not thrown'),
                onRejected: (e) => utils_1.isStatementTimeoutErrorMessage(e.error.message)
                    ? done()
                    : done.fail(`Error message ${e.error.message} does not satisfy determined`),
            });
        }, timeout + 1000);
    }
});
//# sourceMappingURL=pg.test.int.js.map