"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandling_1 = require("../../../../errorHandling");
const maybe_1 = require("folktale/maybe");
const result_1 = require("folktale/result");
const applyToResult_1 = require("../applyToResult");
describe('Application of functions to db results', () => {
    describe('validation', () => {
        const validate = (res) => res === 2
            ? result_1.Ok(2)
            : result_1.Error(errorHandling_1.AppError.Validation('Bad value'));
        describe('Get', () => {
            it('valid result', () => {
                expect(applyToResult_1.applyValidation.get(validate)(maybe_1.of(2))).toEqual(result_1.Ok(maybe_1.of(2)));
            });
            it('invalid result', () => {
                expect(applyToResult_1.applyValidation.get(validate)(maybe_1.of(-1))).toEqual(result_1.Error(errorHandling_1.AppError.Validation('Bad value')));
            });
            it('empty result', () => {
                expect(applyToResult_1.applyValidation.get(validate)(maybe_1.empty())).toEqual(result_1.Ok(maybe_1.empty()));
            });
        });
        describe('Mget', () => {
            it('valid results', () => {
                const results = [maybe_1.of(2), maybe_1.empty()];
                expect(applyToResult_1.applyValidation.mget(validate)(results)).toEqual(result_1.Ok(results));
            });
            it('invalid results', () => {
                const results = [maybe_1.empty(), maybe_1.of(3)];
                expect(applyToResult_1.applyValidation.mget(validate)(results)).toEqual(result_1.Error(errorHandling_1.AppError.Validation('Bad value')));
            });
            it('empty results', () => {
                const results = [];
                expect(applyToResult_1.applyValidation.mget(validate)(results)).toEqual(result_1.Ok([]));
            });
        });
        describe('Search', () => {
            it('valid results', () => {
                const results = [2, 2];
                expect(applyToResult_1.applyValidation.search(validate)(results)).toEqual(result_1.Ok(results));
            });
            it('invalid results', () => {
                const results = [2, 3];
                expect(applyToResult_1.applyValidation.search(validate)(results)).toEqual(result_1.Error(errorHandling_1.AppError.Validation('Bad value')));
            });
            it('empty results', () => {
                const results = [];
                expect(applyToResult_1.applyValidation.search(validate)(results)).toEqual(result_1.Ok([]));
            });
        });
    });
    describe('transformation', () => {
        const transform = (res) => res.toString();
        describe('Get', () => {
            it('valid result', () => {
                expect(applyToResult_1.applyTransformation.get(transform)(maybe_1.of(2))).toEqual('2');
            });
            it('empty result', () => {
                expect(applyToResult_1.applyTransformation.get(transform)(maybe_1.empty())).toBeNull();
            });
        });
        describe('Mget', () => {
            it('valid result', () => {
                expect(applyToResult_1.applyTransformation.mget(transform)([maybe_1.of(2), maybe_1.empty(), maybe_1.of(3)])).toEqual(['2', null, '3']);
            });
            it('empty result', () => {
                expect(applyToResult_1.applyTransformation.mget(transform)([])).toEqual([]);
            });
        });
    });
});
//# sourceMappingURL=applyToResult.test.js.map