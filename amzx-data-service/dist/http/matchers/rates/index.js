"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const postToGet_1 = require("../../_common/postToGet");
const estimate_1 = require("./estimate");
const subrouter = new Router();
exports.default = (rateService) => subrouter
    .get('/rates', estimate_1.default(rateService))
    .post('/rates', postToGet_1.postToGet(estimate_1.default(rateService)));
//# sourceMappingURL=index.js.map