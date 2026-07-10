"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
let timeRepository = {};
exports.timeStart = (name) => {
    timeRepository[name] = new Date();
};
exports.timeEnd = (name) => ramda_1.propIs(Date, name, timeRepository)
    ? new Date().getTime() - ramda_1.prop(name, timeRepository).getTime()
    : null;
//# sourceMappingURL=time.js.map