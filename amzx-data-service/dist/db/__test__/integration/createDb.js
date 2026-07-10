"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const loadConfig_1 = require("../../../loadConfig");
const index_1 = require("../../index");
exports.default = ramda_1.compose(index_1.createPgDriver, loadConfig_1.loadConfig);
//# sourceMappingURL=createDb.js.map