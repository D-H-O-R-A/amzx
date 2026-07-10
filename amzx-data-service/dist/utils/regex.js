"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base58Chars = '[1-9A-HJ-NP-Za-km-z]+';
exports.interval = /^\d+[smhdwMY]$/;
exports.base58 = new RegExp(`^${base58Chars}$`);
exports.assetId = new RegExp(`^(?:WAVES|${base58Chars})$`);
exports.noNullChars = /^[^\x00]*$/;
exports.eip712Signature = /^0x([A-Fa-f0-9])*$/;
// string doesn't have dangding unescaped slash at the end
exports.saneForDbLike = /^(?:.*[^\\])?(?:\\\\)*$/;
//# sourceMappingURL=regex.js.map