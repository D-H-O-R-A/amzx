"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSerializable = (name, data) => ({
    __type: name,
    data: data === null ? null : data,
});
//# sourceMappingURL=serializable.js.map