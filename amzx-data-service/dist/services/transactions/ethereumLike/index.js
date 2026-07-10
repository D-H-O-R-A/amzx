"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withDecimalsProcessing_1 = require("../../_common/transformation/withDecimalsProcessing");
const modifyFeeDecimals_1 = require("../_common/modifyFeeDecimals");
const createService_1 = require("../_common/createService");
exports.default = (repo, assetsService) => withDecimalsProcessing_1.withDecimalsProcessing(modifyFeeDecimals_1.modifyFeeDecimals(assetsService), createService_1.createService(repo));
//# sourceMappingURL=index.js.map