"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../errorHandling");
exports.parseBool = maybeBool => {
    if (ramda_1.isNil(maybeBool)) {
        return result_1.Ok(undefined);
    }
    const err = result_1.Error(new errorHandling_1.ParseError(new Error('Invalid boolean value')));
    if (typeof maybeBool === 'string') {
        switch (true) {
            case maybeBool.toLowerCase() === 'false':
                return result_1.Ok(false);
            case maybeBool.toLowerCase() === 'true':
                return result_1.Ok(true);
            case maybeBool === '':
            case maybeBool === '0':
            case maybeBool === 'undefined':
            case maybeBool === 'NaN':
            case maybeBool.toLowerCase() === 'null':
                return err;
            default:
                return err;
        }
    }
    else if (typeof maybeBool === 'boolean') {
        return result_1.Ok(maybeBool);
    }
    else {
        return err;
    }
};
//# sourceMappingURL=parseBool.js.map