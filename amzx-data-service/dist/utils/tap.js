"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.tap = ramda_1.curryN(2, (fn, x) => {
    fn(x);
    return x;
});
//# sourceMappingURL=tap.js.map