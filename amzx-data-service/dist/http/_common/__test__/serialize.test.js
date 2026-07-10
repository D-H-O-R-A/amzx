"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const data_entities_1 = require("@waves/data-entities");
const list_1 = require("../../../types/list");
const json_1 = require("../../../utils/json");
const types_1 = require("../../types");
const serialize_1 = require("../serialize");
const types_2 = require("../types");
const utils_1 = require("../utils");
const toSerializable = (test) => ({
    __type: 'test',
    data: test,
});
const UNSAFE_NUMBER = '9007199254740993';
const testItem = {
    string: 'response',
    number: new data_entities_1.BigNumber(UNSAFE_NUMBER),
    boolean: true,
};
describe('Serializer', () => {
    describe('get', () => {
        const data = maybe_1.of(testItem);
        it('should correctly serialize data with number LSN Format', () => {
            const lsnFormat = types_1.LSNFormat.Number;
            expect(serialize_1.get(toSerializable, lsnFormat)(data)).toEqual(types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(toSerializable(testItem)), {
                'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
            }));
        });
        it('should correctly serialize data with String LSN Format', () => {
            const lsnFormat = types_1.LSNFormat.String;
            expect(serialize_1.get(toSerializable, lsnFormat)(data)).toEqual(types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(toSerializable(testItem)), {
                'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
            }));
        });
    });
    describe('mget', () => {
        const data = [maybe_1.of(testItem), maybe_1.of(testItem)];
        it('should correctly serialize data with Number LSN Format', () => {
            const lsnFormat = types_1.LSNFormat.Number;
            const response = serialize_1.mget(toSerializable, lsnFormat)(data);
            expect(response).toEqual(types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(list_1.list([testItem, testItem].map(toSerializable))), {
                'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
            }));
        });
        it('should correctly serialize data with String LSN Format', () => {
            const lsnFormat = types_1.LSNFormat.String;
            const response = serialize_1.mget(toSerializable, lsnFormat)(data);
            expect(response).toEqual(types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(list_1.list([testItem, testItem].map(toSerializable))), {
                'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
            }));
        });
    });
    describe('search', () => {
        const data = {
            items: [testItem, testItem],
            isLastPage: true,
        };
        it('should correctly serialize data with Number LSN Format', () => {
            const lsnFormat = types_1.LSNFormat.Number;
            const response = serialize_1.search(toSerializable, lsnFormat)(data);
            expect(response).toEqual(types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(list_1.list(data.items.map(toSerializable), {
                isLastPage: data.isLastPage,
            })), {
                'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
            }));
        });
        it('should correctly serialize data with String LSN Format', () => {
            const lsnFormat = types_1.LSNFormat.String;
            const response = serialize_1.search(toSerializable, lsnFormat)(data);
            expect(response).toEqual(types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(list_1.list(data.items.map(toSerializable), {
                isLastPage: data.isLastPage,
            })), {
                'Content-Type': utils_1.contentTypeWithLSN(lsnFormat),
            }));
        });
    });
});
//# sourceMappingURL=serialize.test.js.map