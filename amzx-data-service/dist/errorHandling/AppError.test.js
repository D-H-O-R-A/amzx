"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = require("./AppError");
const errorTypes = [
    'Init',
    'Resolver',
    'Db',
    'Validation',
    'Timeout',
];
const throwFn = () => {
    throw new Error('Should not happen');
};
const throwPattern = {
    Init: throwFn,
    Resolver: throwFn,
    Validation: throwFn,
    Db: throwFn,
    Timeout: throwFn,
    Parse: throwFn,
};
describe('AppError', () => {
    errorTypes.forEach(type => {
        it(`${type} should be created from message`, () => {
            AppError_1.AppError[type]('Error message', { info: 'some-info' }).matchWith(Object.assign(Object.assign({}, throwPattern), { [type]: (err) => {
                    expect(err.error.message).toEqual('Error message');
                    expect(err.meta).not.toBeUndefined();
                    if (err.meta)
                        expect(err.meta.info).toEqual('some-info');
                } }));
        });
        it(`${type} should be created Error object`, () => {
            AppError_1.AppError[type](new Error('Error message'), {
                info: 'some-info',
            }).matchWith(Object.assign(Object.assign({}, throwPattern), { [type]: (err) => {
                    expect(err.error.message).toEqual('Error message');
                    expect(err.meta).not.toBeUndefined();
                    if (err.meta)
                        expect(err.meta.info).toEqual('some-info');
                } }));
        });
    });
});
//# sourceMappingURL=AppError.test.js.map