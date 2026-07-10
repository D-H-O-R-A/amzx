"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withDecimalsProcessing_1 = require("../_common/transformation/withDecimalsProcessing");
const modifyDecimals_1 = require("./modifyDecimals");
exports.default = (repo, validatePairs, assetsService) => ({
    get: (req) => validatePairs(req.matcher, [req.pair]).chain(() => withDecimalsProcessing_1.getWithDecimalsProcessing(modifyDecimals_1.modifyDecimals(assetsService), repo.get)(req)),
    mget: (req) => validatePairs(req.matcher, req.pairs).chain(() => withDecimalsProcessing_1.mgetWithDecimalsProcessing(modifyDecimals_1.modifyDecimals(assetsService), repo.mget)(req)),
    search: (req) => withDecimalsProcessing_1.searchWithDecimalsProcessing(modifyDecimals_1.modifyDecimals(assetsService), repo.search)(req),
});
//# sourceMappingURL=index.js.map