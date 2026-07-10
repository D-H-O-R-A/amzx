"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../../errorHandling");
const regex_1 = require("../../../utils/regex");
exports.serialize = (request, response) => response === null
    ? undefined
    : Buffer.from(response.asset_id.toString()).toString('base64');
exports.deserialize = (cursor) => {
    let assetId = Buffer.from(cursor, 'base64').toString('utf-8');
    if (regex_1.assetId.test(assetId)) {
        return result_1.Ok(Buffer.from(cursor, 'base64').toString('utf-8'));
    }
    else {
        return result_1.Error(new errorHandling_1.ValidationError('Cursor deserialization is failed', {
            cursor: 'Invalid data',
        }));
    }
};
//# sourceMappingURL=cursor.js.map