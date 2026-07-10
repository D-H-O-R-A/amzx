"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const fp_1 = require("../../../utils/fp");
const ramda_1 = require("ramda");
var applyValidation;
(function (applyValidation) {
    applyValidation.get = (fn) => (m) => fp_1.liftInnerMaybe(result_1.of, fn, m);
    applyValidation.mget = (fn) => (ms) => ramda_1.traverse(result_1.of, (m) => fp_1.liftInnerMaybe(result_1.of, fn, m), ms);
    applyValidation.search = (fn) => (as) => ramda_1.traverse(result_1.of, fn, as);
})(applyValidation = exports.applyValidation || (exports.applyValidation = {}));
var applyTransformation;
(function (applyTransformation) {
    applyTransformation.get = (fn) => (m) => m.map(fn).getOrElse(null);
    applyTransformation.mget = (fn) => (ms) => ms.map(applyTransformation.get(fn));
    applyTransformation.search = (fn) => (as) => as.map(fn);
})(applyTransformation = exports.applyTransformation || (exports.applyTransformation = {}));
//# sourceMappingURL=applyToResult.js.map