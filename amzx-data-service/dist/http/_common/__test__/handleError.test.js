"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandling_1 = require("../../../errorHandling");
const handleError_1 = require("../handleError");
describe('handleError', () => {
    const assertHttpResponse = (code, message, meta = undefined) => (x) => {
        expect(x).toHaveProperty('status', code);
        expect(x).toHaveProperty('body', JSON.stringify({
            message,
            meta,
        }));
        expect(x).toHaveProperty('headers');
    };
    const assertInternalServerErrorHttpResponse = assertHttpResponse(500, errorHandling_1.DEFAULT_INTERNAL_SERVER_ERROR_MESSAGE);
    const assertTimeoutErrorHttpResponse = assertHttpResponse(504, errorHandling_1.DEFAULT_TIMEOUT_OCCURRED_MESSAGE);
    const assertBadRequestErrorHttpResponse = assertHttpResponse(400, errorHandling_1.DEFAULT_BAD_REQUEST_MESSAGE);
    const assertBadRequestErrorHttpResponseWithMeta = (meta) => assertHttpResponse(400, errorHandling_1.DEFAULT_BAD_REQUEST_MESSAGE, meta);
    describe('internal server error handling', () => {
        it('should handle Init, Db, Resolver errors and return valid InternalServerError httpResponse', () => {
            assertInternalServerErrorHttpResponse(handleError_1.handleError(errorHandling_1.AppError.Init('init error')));
            assertInternalServerErrorHttpResponse(handleError_1.handleError(errorHandling_1.AppError.Db('db error')));
            assertInternalServerErrorHttpResponse(handleError_1.handleError(errorHandling_1.AppError.Resolver('resolver error')));
        });
    });
    describe('timeout error handling', () => {
        it('should handle Timeout error and return valid TimeoutOccured httpResponse', () => {
            assertTimeoutErrorHttpResponse(handleError_1.handleError(errorHandling_1.AppError.Timeout('timeout error')));
        });
    });
    describe('bad request', () => {
        describe('parse error', () => {
            it('should handle Parse error and return valid BadRequest httpResponse', () => {
                const parseErrorMessage = 'parse error';
                assertBadRequestErrorHttpResponseWithMeta([
                    {
                        message: parseErrorMessage,
                    },
                ])(handleError_1.handleError(errorHandling_1.AppError.Parse(parseErrorMessage)));
            });
        });
        describe('validation error handling', () => {
            assertBadRequestErrorHttpResponse(handleError_1.handleError(errorHandling_1.AppError.Validation('validation error')));
            const err = {
                details: [
                    {
                        message: 'joi error',
                        type: 'error type',
                        path: ['error', 'property', 'path'],
                    },
                ],
            };
            it('should handle Validation error and return valid BadRequest httpResponse', () => {
                assertBadRequestErrorHttpResponseWithMeta(err.details.map(item => ({
                    message: item.message,
                })))(handleError_1.handleError(errorHandling_1.AppError.Validation('validation error', err)));
                const meta = { message: 'error description' };
                assertBadRequestErrorHttpResponseWithMeta([meta])(handleError_1.handleError(errorHandling_1.AppError.Validation('validation error', meta)));
            });
        });
    });
});
//# sourceMappingURL=handleError.test.js.map