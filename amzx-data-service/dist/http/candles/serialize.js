"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const json_1 = require("../../utils/json");
const serialize_1 = require("../_common/serialize");
const types_2 = require("../_common/types");
const utils_1 = require("../_common/utils");
exports.serialize = (data, lsnFormat) => {
    if (data.items.length) {
        return serialize_1.search(types_1.candle, lsnFormat)(data);
    }
    else {
        return types_2.HttpResponse.NotFound();
    }
};
exports.serializeCandleInfo = (data, lsnFormat) => {
    if (data) {
        return types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(types_1.candle(data))).withHeaders({
            'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
        });
    }
    else {
        return types_2.HttpResponse.NotFound();
    }
};
//# sourceMappingURL=serialize.js.map