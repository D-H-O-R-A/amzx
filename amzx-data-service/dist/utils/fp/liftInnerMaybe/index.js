"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swapMaybeF_1 = require("../swapMaybeF");
const ramda_1 = require("ramda");
function liftInnerMaybe(F, fn, maybe) {
    return ramda_1.compose((m) => swapMaybeF_1.swapMaybeF(F, m), ramda_1.map(fn))(maybe);
}
exports.liftInnerMaybe = liftInnerMaybe;
//# sourceMappingURL=index.js.map