"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseResolve = (val, delay = 100) => new Promise(res => setTimeout(() => res(val), delay));
exports.promiseReject = (err, delay = 100) => new Promise((res, rej) => setTimeout(() => rej(err), delay));
//# sourceMappingURL=index.js.map