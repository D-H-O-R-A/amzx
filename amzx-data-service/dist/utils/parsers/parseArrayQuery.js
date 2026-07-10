"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../errorHandling");
function parseArrayQuery(strOrArr) {
    if (ramda_1.isNil(strOrArr)) {
        return result_1.Ok(undefined);
    }
    else if (typeof strOrArr === 'string') {
        if (!strOrArr.length)
            return result_1.Ok([]);
        else
            return result_1.Ok(strOrArr.split(','));
    }
    else if (Array.isArray(strOrArr)) {
        return result_1.Ok(strOrArr);
    }
    else {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Invalid array')));
    }
}
exports.parseArrayQuery = parseArrayQuery;
//# sourceMappingURL=parseArrayQuery.js.map