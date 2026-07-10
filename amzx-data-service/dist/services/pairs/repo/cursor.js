"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../../errorHandling");
exports.serialize = (request, response) => Buffer.from(`${response.amount_asset_id}:${response.price_asset_id}`).toString('base64');
exports.deserialize = (cursor) => {
    const data = Buffer.from(cursor, 'base64')
        .toString('utf8')
        .split(':');
    if (data.length === 2) {
        return result_1.Ok(data);
    }
    else {
        return result_1.Error(new errorHandling_1.ValidationError('Invalid cursor'));
    }
};
//# sourceMappingURL=cursor.js.map