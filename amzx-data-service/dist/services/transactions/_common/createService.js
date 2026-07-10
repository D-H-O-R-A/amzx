"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createService = (repo) => ({
    get: (req) => repo.get(req.id),
    mget: (req) => repo.mget(req.ids),
    search: (req) => repo.search(req),
});
//# sourceMappingURL=createService.js.map