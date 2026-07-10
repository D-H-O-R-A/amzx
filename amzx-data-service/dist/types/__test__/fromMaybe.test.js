"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const maybe_1 = require("folktale/maybe");
const serializable_1 = require("../serializable");
const data = { id: 'qwe', timestamp: new Date() };
const mock = {
    __type: 'mock',
    data,
};
const mockWithNull = {
    __type: 'mock',
    data: null,
};
const transform = (raw) => {
    return raw
        ? serializable_1.toSerializable('mock', raw)
        : serializable_1.toSerializable('mock', null);
};
describe('fromMaybe should construct type from', () => {
    it('Just', () => expect(__1.fromMaybe(transform)(maybe_1.of(data))).toEqual(mock));
    it('Nothing', () => expect(__1.fromMaybe(transform)(maybe_1.empty())).toEqual(mockWithNull));
});
//# sourceMappingURL=fromMaybe.test.js.map