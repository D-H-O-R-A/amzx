"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const loadConfig_1 = require("../../loadConfig");
const load = () => (Object.assign(Object.assign({}, loadConfig_1.loadDefaultConfig()), { pairsUpdateInterval: process.env.PAIRS_UPDATE_INTERVAL
        ? parseInt(process.env.PAIRS_UPDATE_INTERVAL)
        : 2500, pairsUpdateTimeout: process.env.PAIRS_UPDATE_TIMEOUT
        ? parseInt(process.env.PAIRS_UPDATE_TIMEOUT)
        : 20000 }));
exports.loadConfig = ramda_1.memoizeWith(ramda_1.always('config'), load);
//# sourceMappingURL=loadConfig.js.map