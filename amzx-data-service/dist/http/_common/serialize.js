"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const json_1 = require("../../utils/json");
const types_2 = require("../types");
const types_3 = require("./types");
const utils_1 = require("./utils");
exports.get = (toSerializable, lsnFormat = types_2.LSNFormat.String) => (m) => m.matchWith({
    Just: ({ value }) => types_3.HttpResponse.Ok(json_1.stringify(lsnFormat)(toSerializable(value))).withHeaders({
        'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
    }),
    Nothing: () => types_3.HttpResponse.NotFound(),
});
exports.mget = (toSerializable, lsnFormat = types_2.LSNFormat.String) => (ms) => types_3.HttpResponse.Ok(json_1.stringify(lsnFormat)(types_1.list(ms.map(maybe => maybe.matchWith({
    Just: ({ value }) => toSerializable(value),
    Nothing: () => toSerializable(null),
}))))).withHeaders({
    'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
});
exports.search = (toSerializable, lsnFormat = types_2.LSNFormat.String) => (data) => types_3.HttpResponse.Ok(json_1.stringify(lsnFormat)(types_1.list(data.items.map(a => toSerializable(a)), {
    isLastPage: data.isLastPage,
    lastCursor: data.lastCursor,
}))).withHeaders({
    'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
});
//# sourceMappingURL=serialize.js.map