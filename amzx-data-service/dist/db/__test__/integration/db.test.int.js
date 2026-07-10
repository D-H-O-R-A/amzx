"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createDb_1 = require("./createDb");
describe('Db', () => {
    const db = createDb_1.default();
    it('should successefully execute simple SQL-query', done => {
        db.one('select 1')
            .run()
            .listen({
            onResolved: () => done(),
            onRejected: e => done.fail(e.error.message),
        });
    });
});
//# sourceMappingURL=db.test.int.js.map