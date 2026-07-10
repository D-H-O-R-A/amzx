"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const LRU = require("lru-cache");
const data_1 = require("../../data");
const keyFn = (matcher) => (pair) => {
    return `${matcher}::${pair.amountAsset.id}::${pair.priceAsset.id}`;
};
class RateCacheImpl {
    constructor(size, maxAgeMillis) {
        this.lru = new LRU({ max: size, maxAge: maxAgeMillis });
    }
    has(key) {
        const getKey = keyFn(key.matcher);
        return this.lru.has(getKey(key.pair));
    }
    set(key, data) {
        this.lru.set(keyFn(key.matcher)(key.pair), data);
    }
    get(key) {
        const getKey = keyFn(key.matcher);
        return maybe_1.fromNullable(this.lru.get(getKey(key.pair))).orElse(() => maybe_1.fromNullable(this.lru.get(getKey(data_1.flip(key.pair)))));
    }
}
exports.default = RateCacheImpl;
//# sourceMappingURL=RateCache.js.map