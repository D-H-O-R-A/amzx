"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../../../errorHandling");
const __1 = require("..");
const assetId = 'G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH';
// mock validation
const inputOk = (s) => task_1.of(s);
const resultOk = (s) => result_1.Ok(s);
const resultError = (s) => result_1.Error(errorHandling_1.AppError.Resolver(s));
afterEach(() => jest.clearAllMocks());
describe('Resolver', () => {
    const mockPgDriver = {
        one: (s) => task_1.of(s),
    };
    const commonConfig = {
        transformInput: result_1.Ok,
        transformResult: ramda_1.identity,
        getData: (id) => mockPgDriver.one(id).map(maybe_1.of),
        emitEvent: () => () => undefined,
    };
    const createMockResolver = (validateInput, validateResult) => __1.get(Object.assign(Object.assign({}, commonConfig), { validateResult }));
    it('should return result if all validation pass', done => {
        const goodResolver = createMockResolver(inputOk, resultOk);
        goodResolver(assetId)
            .run()
            .listen({
            onResolved: data => {
                expect(data.getOrElse(null)).toEqual(assetId);
                done();
            },
        });
    });
    it('should call db query if everything is ok', done => {
        const spiedDbQuery = jest.spyOn(mockPgDriver, 'one');
        const goodResolver = __1.get(Object.assign(Object.assign({}, commonConfig), { validateResult: resultOk }));
        goodResolver(assetId)
            .run()
            .listen({
            onResolved: () => {
                expect(spiedDbQuery).toBeCalled();
                done();
            },
        });
    });
    it('should emit events with correct values if everything is ok', done => {
        // emitEvent('RESOLVE')(payload)
        const innerSpy = jest.fn();
        const outerSpy = jest.fn((eventName) => (payload) => innerSpy(eventName, payload));
        const goodResolver = __1.get(Object.assign(Object.assign({}, commonConfig), { validateResult: resultOk, emitEvent: outerSpy }));
        goodResolver(assetId)
            .run()
            .listen({
            onResolved: () => {
                expect(innerSpy.mock.calls).toEqual([
                    [
                        'TRANSFORM_INPUT_OK',
                        'G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH',
                    ],
                    [
                        'DB_QUERY_OK',
                        maybe_1.of('G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH'),
                    ],
                    [
                        'RESULT_VALIDATION_OK',
                        maybe_1.of('G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH'),
                    ],
                    [
                        'TRANSFORM_RESULT_OK',
                        maybe_1.of('G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH'),
                    ],
                ]);
                done();
            },
        });
    });
    it('should take left branch if output validation fails', done => {
        const badOutputResolver = createMockResolver(inputOk, resultError);
        badOutputResolver(assetId)
            .run()
            .listen({
            onRejected: e => {
                expect(e).toEqual(errorHandling_1.AppError.Resolver(assetId));
                done();
            },
        });
    });
});
//# sourceMappingURL=get.test.js.map