"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const parseArrayQuery_1 = require("./parseArrayQuery");
exports.parsePairs = (pairsRaw) => ramda_1.isNil(pairsRaw)
    ? result_1.Ok(undefined)
    : parseArrayQuery_1.parseArrayQuery(pairsRaw).map(pairs => pairs.map(ramda_1.compose(([amountAsset, priceAsset]) => ({ amountAsset, priceAsset }), ramda_1.split('/'))));
//# sourceMappingURL=parsePairs.js.map