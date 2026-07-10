"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const ramda_1 = require("ramda");
const validation_1 = require("../../../../../../utils/validation");
const getById_1 = require("../../getById");
const createService = (resultSchema) => getById_1.getByIdPreset({
    name: 'some_name',
    sql: ramda_1.identity,
    resultSchema,
    transformResult: ramda_1.identity,
})({
    pg: { oneOrNone: (id) => task_1.of(id) },
    emitEvent: ramda_1.always(ramda_1.T),
});
describe('getById', () => {
    describe('input validation', () => {
        // passing result validation
        const service = createService(validation_1.Joi.any());
        it('passes if id param is a string', done => service('someidgoeshere2942415')
            .run()
            .listen({
            onResolved: x => {
                expect(x).toBeJust('someidgoeshere2942415');
                done();
            },
            onRejected: () => done.fail,
        }));
    });
    describe('result validation', () => {
        // failing result validation
        const service = createService(validation_1.Joi.any().valid('qweasd'));
        it('applies schema correctly', done => service('someidgoeshere2942415')
            .run()
            .listen({
            onRejected: e => {
                expect(e.type).toBe('Resolver');
                done();
            },
        }));
    });
});
//# sourceMappingURL=validation.test.js.map