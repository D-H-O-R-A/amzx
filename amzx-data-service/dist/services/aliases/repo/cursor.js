"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
exports.serialize = (request, response) => Buffer.from(response.alias).toString('base64');
exports.deserialize = (cursor) => {
    return result_1.Ok(Buffer.from(cursor, 'base64').toString('utf8'));
};
//# sourceMappingURL=cursor.js.map