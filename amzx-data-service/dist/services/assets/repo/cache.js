"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const LRU = require("lru-cache");
exports.create = (size, maxAgeMillis) => {
    const cache = new LRU({
        max: size,
        maxAge: maxAgeMillis,
    });
    return {
        has: key => {
            return cache.has(key);
        },
        get: key => maybe_1.fromNullable(cache.get(key)),
        set: (key, value) => {
            cache.set(key, value);
        },
    };
};
//# sourceMappingURL=cache.js.map