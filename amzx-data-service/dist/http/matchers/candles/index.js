"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const _common_1 = require("../../_common");
const serialize_1 = require("../../candles/serialize");
const parse_1 = require("./parse");
const subrouter = new Router();
exports.default = ({ search }) => subrouter.get('/candles/:amountAsset/:priceAsset', _common_1.createHttpHandler((req, lsnFormat) => search(req).map(res => serialize_1.serialize(res, lsnFormat)), parse_1.parse));
//# sourceMappingURL=index.js.map