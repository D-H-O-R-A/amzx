"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const data_entities_1 = require("@waves/data-entities");
const errorHandling_1 = require("../../../errorHandling");
const _common_1 = require("../../_common");
const isSortOrder = (s) => s === _common_1.SortOrder.Ascending || s === _common_1.SortOrder.Descending;
exports.serialize = (request, response) => response === null
    ? undefined
    : Buffer.from(`${response.uid.toString()}::${request.sort}`).toString('base64');
exports.deserialize = (cursor) => {
    const data = Buffer.from(cursor, 'base64').toString('utf8').split('::');
    const err = (message) => new errorHandling_1.ValidationError('Cursor deserialization is failed', {
        cursor,
        message,
    });
    return (result_1.Ok(data)
        // validate length
        .chain((d) => d.length === 2
        ? result_1.Ok(d)
        : result_1.Error(err('Cursor length is not equals to 2')))
        .chain((d) => {
        const s = d[1];
        if (isSortOrder(s)) {
            return result_1.Ok([
                new data_entities_1.BigNumber(d[0]),
                s,
            ]);
        }
        else {
            return result_1.Error(err('Sort is not valid'));
        }
    })
        .map(([uid, sort]) => ({
        uid,
        sort,
    })));
};
//# sourceMappingURL=cursor.js.map