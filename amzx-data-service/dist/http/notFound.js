"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const _common_1 = require("./_common");
const types_1 = require("./_common/types");
exports.default = _common_1.createHttpHandler(() => task_1.of(types_1.HttpResponse.NotFound()));
//# sourceMappingURL=notFound.js.map