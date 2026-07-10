"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const task_1 = require("folktale/concurrency/task");
const validation_1 = require("../../../../../../utils/validation");
const mgetByIds_1 = require("../../mgetByIds");
const createService = (resultSchema) => mgetByIds_1.mgetByIdsPreset({
    name: 'some_name',
    sql: (s) => s.join(';'),
    matchRequestResult: ramda_1.equals,
    resultSchema,
    transformResult: ramda_1.identity,
})({
    pg: {
        any: ids => task_1.of(ids.split(';')),
    },
    emitEvent: ramda_1.always(ramda_1.T),
});
describe('mgetByIds', () => {
    describe('input validation', () => {
        // passing result validation
        const service = createService(validation_1.Joi.any());
        it('passes if ids param is an empty array', done => service([])
            .run()
            .listen({
            onResolved: x => {
                expect(x).toBeInstanceOf(Array);
                done();
            },
        }));
        it('passes if ids param is a base58 string array', done => service(['someidgoeshere2942415', 'qwe', 'asd'])
            .run()
            .listen({
            onResolved: x => {
                expect(x).toBeInstanceOf(Array);
                done();
            },
        }));
    });
    describe('result validation', () => {
        // failing result validation
        const service = createService(validation_1.Joi.any().valid('qweasd'));
        it('applies schema correctly', done => service(['someidgoeshere2942415'])
            .run()
            .listen({
            onRejected: e => {
                expect(e.type).toBe('Resolver');
                done();
            },
            onResolved: console.log,
        }));
    });
});
//# sourceMappingURL=validation.test.js.map