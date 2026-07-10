"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
// @hack because of ramda 'tap' not working with null values
// https://github.com/ramda/ramda/issues/2421
// @todo refactor after ramda fix
const tap_1 = require("../../../utils/tap");
const fp_1 = require("../../../utils/fp");
const applyToResult_1 = require("./applyToResult");
var applyToResult_2 = require("./applyToResult");
exports.applyTransformation = applyToResult_2.applyTransformation;
const createResolver = (transformInput, getData, validateAllResults, transformAllResults, emitEvent, request) => task_1.of(request)
    .map(transformInput)
    .chain(fp_1.resultToTask)
    .map(tap_1.tap(emitEvent('TRANSFORM_INPUT_OK')))
    .chain(getData)
    .map(tap_1.tap(emitEvent('DB_QUERY_OK')))
    .map(validateAllResults)
    .chain(fp_1.resultToTask)
    .map(tap_1.tap(emitEvent('RESULT_VALIDATION_OK')))
    .map((result) => transformAllResults(result, request))
    .map(tap_1.tap(emitEvent('TRANSFORM_RESULT_OK')));
const getResolver = (dependencies) => (request) => createResolver(dependencies.transformInput, dependencies.getData, applyToResult_1.applyValidation.get(dependencies.validateResult), result => dependencies.transformResult(result, request), dependencies.emitEvent, request);
const mgetResolver = (dependencies) => (request) => createResolver(dependencies.transformInput, dependencies.getData, applyToResult_1.applyValidation.mget(dependencies.validateResult), result => dependencies.transformResult(result, request), dependencies.emitEvent, request);
const searchResolver = (dependencies) => (request) => createResolver(dependencies.transformInput, dependencies.getData, applyToResult_1.applyValidation.search(dependencies.validateResult), result => dependencies.transformResult(result, request), dependencies.emitEvent, request);
exports.get = getResolver;
exports.mget = mgetResolver;
exports.search = searchResolver;
//# sourceMappingURL=index.js.map