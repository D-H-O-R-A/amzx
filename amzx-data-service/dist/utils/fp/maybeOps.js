"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmpty = (ma) => ma.matchWith({
    Just: () => false,
    Nothing: () => true,
});
exports.isDefined = (ma) => !exports.isEmpty(ma);
exports.map2 = (fn, ma, mb) => ma.chain(a => mb.map(b => fn(a, b)));
exports.forEach = (f, ma) => ma.matchWith({
    Just: ({ value }) => f(value),
    Nothing: () => undefined,
});
//# sourceMappingURL=maybeOps.js.map