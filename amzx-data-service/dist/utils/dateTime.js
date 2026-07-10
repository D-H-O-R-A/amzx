"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const setMilliseconds = ramda_1.curry((ms, dateTime) => new Date(dateTime.setMilliseconds(ms)));
const setSeconds = ramda_1.curry((sec, dateTime) => new Date(dateTime.setSeconds(sec)));
const incMinutes = ramda_1.curry((min, dateTime) => new Date(dateTime.getTime() + 60 * 1000 + min));
exports.truncMilliseconds = setMilliseconds(0);
exports.truncSeconds = ramda_1.compose(setSeconds(0), setMilliseconds(0));
exports.fillSeconds = ramda_1.compose(incMinutes(1), setSeconds(0), setMilliseconds(0));
//# sourceMappingURL=dateTime.js.map