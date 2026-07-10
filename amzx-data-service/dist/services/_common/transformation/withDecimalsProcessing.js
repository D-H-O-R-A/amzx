"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const fp_1 = require("../../../utils/fp");
const types_1 = require("../../types");
exports.getWithDecimalsProcessing = (modifyDecimals, get) => (req) => get(req).chain((m) => req.moneyFormat == types_1.MoneyFormat.Long
    ? task_1.of(m)
    : fp_1.swapMaybeF(task_1.of, m.map((item) => modifyDecimals([item]).map((res) => res[0]))));
exports.mgetWithDecimalsProcessing = (modifyDecimals, mget) => (req) => mget(req).chain((ms) => req.moneyFormat == types_1.MoneyFormat.Long
    ? task_1.of(ms)
    : modifyDecimals(ms
        .filter((m) => m.matchWith({
        Just: () => true,
        Nothing: () => false,
    }))
        .map((m) => m.unsafeGet())).map((res) => {
        let idx = 0;
        return ms.map((m) => m.matchWith({
            Just: (_) => maybe_1.of(res[idx++]),
            Nothing: () => maybe_1.empty(),
        }));
    }));
exports.searchWithDecimalsProcessing = (modifyDecimals, search) => (req) => search(req).chain((res) => req.moneyFormat == types_1.MoneyFormat.Long
    ? task_1.of(res)
    : modifyDecimals(res.items).map((items) => (Object.assign(Object.assign({}, res), { items }))));
exports.withDecimalsProcessing = (modifyDecimals, service) => ({
    get: exports.getWithDecimalsProcessing(modifyDecimals, service.get),
    mget: exports.mgetWithDecimalsProcessing(modifyDecimals, service.mget),
    search: exports.searchWithDecimalsProcessing(modifyDecimals, service.search),
});
//# sourceMappingURL=withDecimalsProcessing.js.map