"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
exports.resultToTask = (r) => r.matchWith({
    Ok: ({ value }) => task_1.of(value),
    Error: ({ value }) => task_1.rejected(value),
});
//# sourceMappingURL=resultToTask.js.map