"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDbResponse = (result) => ({
    alias: result.alias,
    address: result.duplicates > 1 ? null : result.address,
});
//# sourceMappingURL=transformResult.js.map