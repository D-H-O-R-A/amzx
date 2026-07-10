"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (repo) => ({
    get: (req) => repo.get(req.id),
    mget: (req) => repo.mget(req.aliases),
    search: (req) => repo.search(req),
});
//# sourceMappingURL=index.js.map