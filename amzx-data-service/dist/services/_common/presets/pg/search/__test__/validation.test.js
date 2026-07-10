"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("./../../../../../../errorHandling");
const validation_1 = require("../../../../../../utils/validation");
const __1 = require("../../../..");
const search_1 = require("../../search");
const mockTxs = [
    { uid: 1, id: 'q', timestamp: new Date() },
    { uid: 2, id: 'w', timestamp: new Date() },
];
const serialize = (request, response) => response === null
    ? undefined
    : Buffer.from(response.uid.toString()).toString('base64');
const deserialize = (cursor) => {
    const data = Buffer.from(cursor, 'base64')
        .toString('utf8')
        .split('::');
    const err = (message) => new errorHandling_1.ValidationError('Cursor deserialization is failed', {
        cursor,
        message,
    });
    return (result_1.Ok(data)
        // validate length
        .chain(d => d.length === 1
        ? result_1.Ok(parseInt(d[0]))
        : result_1.Error(err('Cursor length is not equals to 1')))
        .map(uid => ({
        uid,
    })));
};
const service = search_1.searchPreset({
    name: 'some_name',
    sql: () => '',
    resultSchema: validation_1.Joi.any(),
    transformResult: ramda_1.identity,
    cursorSerialization: {
        serialize,
        deserialize,
    },
})({
    pg: { any: filters => task_1.of(mockTxs) },
    emitEvent: ramda_1.always(ramda_1.T),
});
describe('search preset validation', () => {
    describe('common filters', () => {
        it('passes if correct object is provided', done => service({
            limit: 1,
            sort: __1.SortOrder.Descending,
        })
            .run()
            .listen({
            onResolved: (x) => {
                expect(x.items).toBeInstanceOf(Array);
                done();
            },
            onRejected: (e) => {
                done(e.error.message);
            },
        }));
    });
});
//# sourceMappingURL=validation.test.js.map