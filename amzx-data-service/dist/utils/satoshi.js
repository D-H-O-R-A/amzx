"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.convertPrice = ramda_1.curry((aDecimals, pDecimals, price) => price.shiftedBy(-8 + aDecimals - pDecimals));
exports.convertAmount = ramda_1.curry((decimals, amount) => amount.shiftedBy(-decimals));
//# sourceMappingURL=satoshi.js.map