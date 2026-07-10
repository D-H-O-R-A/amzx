"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const result_1 = require("folktale/result");
const task_1 = require("folktale/concurrency/task");
const _1 = require(".");
test('swapMaybeF with Result as F', () => {
    const a = maybe_1.of(result_1.of(1));
    expect(_1.swapMaybeF(result_1.of, a)).toEqual(result_1.of(maybe_1.of(1)));
});
test('swapMaybeF with Task as F', () => {
    task_1.waitAll([_1.swapMaybeF(task_1.of, maybe_1.of(task_1.of(1))), task_1.of(maybe_1.of(1))])
        .run()
        .listen({
        onResolved: xs => expect(xs[0]).toEqual(xs[1]),
    });
});
//# sourceMappingURL=swapMaybeF.test.js.map