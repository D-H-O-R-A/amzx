"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _common_1 = require("../../_common");
const parse_1 = require("./parse");
const serialize_1 = require("./serialize");
exports.default = (service) => _common_1.createHttpHandler((req, lsnFormat) => service(req).map((res) => serialize_1.serialize(res, lsnFormat)), parse_1.parse);
//# sourceMappingURL=estimate.js.map