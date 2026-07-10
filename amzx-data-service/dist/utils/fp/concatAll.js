"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatAll = (monoid) => (list) => {
    return list.reduce(monoid.concat, monoid.empty);
};
//# sourceMappingURL=concatAll.js.map