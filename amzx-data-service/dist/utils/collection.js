"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collect = (partialFunction) => (arr) => {
    const res = [];
    arr.forEach((a, idx) => {
        const maybeB = partialFunction(a, idx);
        if (typeof maybeB !== 'undefined') {
            res.push(maybeB);
        }
    });
    return res;
};
//# sourceMappingURL=collection.js.map