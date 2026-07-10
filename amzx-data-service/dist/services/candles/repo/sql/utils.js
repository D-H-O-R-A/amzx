"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const result_1 = require("folktale/result");
const interval_1 = require("../../../../utils/interval");
const errorHandling_1 = require("../../../../errorHandling");
exports.highestDividerLessThan = (inter, dividers) => {
    const i = ramda_1.findLast((i) => interval_1.div(inter, i) >= 1, dividers);
    return i ? result_1.Ok(i) : result_1.Error(new errorHandling_1.ValidationError('Divider not found'));
};
//# sourceMappingURL=utils.js.map