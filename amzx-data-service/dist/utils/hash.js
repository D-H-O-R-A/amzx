"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
exports.md5 = (s) => crypto_1.createHash('md5')
    .update(s)
    .digest('hex');
//# sourceMappingURL=hash.js.map