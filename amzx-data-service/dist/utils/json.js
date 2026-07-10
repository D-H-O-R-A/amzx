"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createParser = require("@waves/parse-json-bignumber");
const data_entities_1 = require("@waves/data-entities");
const bigNumber_1 = require("./bigNumber");
const types_1 = require("../http/types");
const parser = createParser({
    strict: false,
    isInstance: (bn) => data_entities_1.BigNumber.isBigNumber(bn),
    stringify: (bn) => bn.toFixed(),
    parse: bigNumber_1.toBigNumber,
});
exports.parse = parser.parse;
exports.stringify = (lsnFormat) => createParser({
    strict: false,
    isInstance: (bn) => data_entities_1.BigNumber.isBigNumber(bn),
    stringify: (bn) => lsnFormat === types_1.LSNFormat.Number ? bn.toFixed() : `"${bn.toString()}"`,
    parse: bigNumber_1.toBigNumber,
}).stringify;
//# sourceMappingURL=json.js.map