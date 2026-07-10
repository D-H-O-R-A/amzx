"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withDecimalsProcessing_1 = require("../../_common/transformation/withDecimalsProcessing");
const createService_1 = require("../_common/createService");
const modifyDecimals_1 = require("./modifyDecimals");
exports.default = (repo, assetsService) => withDecimalsProcessing_1.withDecimalsProcessing(modifyDecimals_1.modifyDecimals(assetsService), createService_1.createService(repo));
//# sourceMappingURL=index.js.map