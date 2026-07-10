"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const errorHandling_1 = require("../../errorHandling");
exports.default = (repo) => ({
    get: (req) => repo.get(req.id),
    mget: (req) => repo.mget(req.ids),
    search: (req) => repo.search(req),
    precisions: (req) => {
        const assetIds = new Map();
        req.ids.forEach((assetId) => {
            // only new id
            if (!assetIds.has(assetId)) {
                assetIds.set(assetId, assetIds.size);
            }
        });
        return repo.mget(Array.from(assetIds.keys())).chain((ms) => task_1.waitAll(ms.map((ma, idx) => ma.matchWith({
            Just: ({ value: a }) => task_1.of(a.precision),
            Nothing: () => task_1.rejected(errorHandling_1.AppError.Resolver(`Asset ${req.ids[idx]} precision not found.`)),
        }))).map(precisions => {
            // asset id is guaranteed to exist
            return req.ids.map(id => precisions[assetIds.get(id)]);
        }));
    }
});
//# sourceMappingURL=index.js.map