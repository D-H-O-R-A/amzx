"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../errorHandling");
exports.parseDate = str => {
    if (ramda_1.isNil(str))
        return result_1.Ok(undefined);
    const d = new Date(/^-?\d+$/.test(str) ? parseInt(str) : str);
    return isNaN(d.getTime())
        ? result_1.Error(new errorHandling_1.ParseError('Date is not valid'))
        : result_1.Ok(d);
};
//# sourceMappingURL=parseDate.js.map