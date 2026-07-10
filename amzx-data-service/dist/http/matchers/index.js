"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const pairs_1 = require("./pairs");
const candles_1 = require("./candles");
const rates_1 = require("./rates");
const subrouter = new Router({ prefix: '/matchers/:matcher' });
exports.default = ({ pairs, candles, rates, }) => subrouter
    .use(pairs_1.default(pairs).routes())
    .use(candles_1.default(candles).routes())
    .use(rates_1.default(rates).routes());
//# sourceMappingURL=index.js.map