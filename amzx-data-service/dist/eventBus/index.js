"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const ramda_1 = require("ramda");
const createEventBus = () => new events_1.EventEmitter();
exports.default = ramda_1.memoizeWith(ramda_1.always('eventBus'), createEventBus);
//# sourceMappingURL=index.js.map