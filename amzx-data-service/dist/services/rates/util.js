"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const data_entities_1 = require("@waves/data-entities");
function safeDivide(n1, n2) {
    return maybe_1.of(n2)
        .filter((it) => !it.isZero())
        .map((it) => n1.div(it));
}
exports.safeDivide = safeDivide;
exports.inv = (n) => safeDivide(new data_entities_1.BigNumber(1), n);
exports.invOnSatoshi = (n, precision) => safeDivide(new data_entities_1.BigNumber(10 ** precision), n);
exports.isSymmetric = (byFn) => (item) => {
    const [p1, p2] = byFn(item);
    return p1 === p2;
};
//# sourceMappingURL=util.js.map