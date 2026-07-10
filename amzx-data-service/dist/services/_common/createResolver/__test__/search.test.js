"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../../../errorHandling");
const createResolver_1 = require("../../createResolver");
const ids = [
    'G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH',
    '5ZUsD93EbK1SZZa2GXYZx3SjhcXWDvMKqzWoJZjNGkW8',
];
const errorMessage = 'Bad value';
// mock validation
const resultOk = (s) => result_1.Ok(s);
const resultError = (s) => result_1.Error(errorHandling_1.AppError.Resolver(errorMessage));
const mockPgDriver = {
    many: (query) => task_1.of(query.split('::')),
};
const commonConfig = {
    transformInput: result_1.Ok,
    transformResult: (items) => ({
        isLastPage: false,
        items,
    }),
    getData: (ids) => mockPgDriver.many(ids.join('::')),
    emitEvent: () => () => undefined,
};
const createMockResolver = (validateResult) => createResolver_1.search(Object.assign(Object.assign({}, commonConfig), { validateResult }));
afterEach(() => jest.clearAllMocks());
describe('Resolver', () => {
    it('should return result if all validation pass', done => {
        const goodResolver = createMockResolver(resultOk);
        goodResolver(ids)
            .run()
            .listen({
            onResolved: data => {
                expect(data).toEqual({
                    isLastPage: false,
                    items: ids,
                });
                done();
            },
        });
    });
    it('should call db query is everything is ok', done => {
        const spiedDbQuery = jest.spyOn(mockPgDriver, 'many');
        const goodResolver = createResolver_1.search(Object.assign(Object.assign({}, commonConfig), { validateResult: resultOk }));
        goodResolver(ids)
            .run()
            .listen({
            onResolved: () => {
                expect(spiedDbQuery).toBeCalled();
                done();
            },
        });
    });
    it('should take left branch if output validation fails', done => {
        const badOutputResolver = createMockResolver(resultError);
        badOutputResolver(ids)
            .run()
            .listen({
            onRejected: e => {
                expect(e).toEqual(errorHandling_1.AppError.Resolver(errorMessage));
                done();
            },
        });
    });
});
//# sourceMappingURL=search.test.js.map