"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const ramda_1 = require("ramda");
exports.parseTrimmedStringIfDefined = q => result_1.Ok(ramda_1.isNil(q) ? undefined : q.toString().trim());
//# sourceMappingURL=parseString.js.map