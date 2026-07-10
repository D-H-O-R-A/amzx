"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const LRU = require("lru-cache");
exports.create = (size, maxAgeMillis) => {
    const cache = new LRU({
        max: size,
        maxAge: maxAgeMillis,
    });
    const toStringKey = (req) => req.matcher + req.pair.amountAsset + req.pair.priceAsset;
    return {
        has: key => cache.has(toStringKey(key)),
        get: key => {
            const k = toStringKey(key);
            const p = cache.get(k);
            return maybe_1.fromNullable(p);
        },
        set: (key, value) => cache.set(toStringKey(key), value),
    };
};
//# sourceMappingURL=cache.js.map