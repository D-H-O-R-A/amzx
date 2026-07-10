"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
function swapMaybeF(F, maybe) {
    return maybe.matchWith({
        Nothing: () => F(maybe_1.empty()),
        Just: ({ value }) => value.map(maybe_1.of),
    });
}
exports.swapMaybeF = swapMaybeF;
//# sourceMappingURL=index.js.map