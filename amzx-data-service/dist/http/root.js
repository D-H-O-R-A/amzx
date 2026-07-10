"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const { version } = require('../../package.json');
const _common_1 = require("./_common");
const types_1 = require("./_common/types");
const utils_1 = require("./_common/utils");
exports.default = _common_1.createHttpHandler(() => task_1.of(types_1.HttpResponse.Ok(utils_1.defaultStringify({
    version,
    github: 'https://github.com/wavesplatform/data-service',
    docsUrl: process.env.DOCS_URL ? process.env.DOCS_URL : undefined,
}))));
//# sourceMappingURL=root.js.map