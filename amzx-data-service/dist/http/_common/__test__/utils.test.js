"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../../errorHandling");
const types_1 = require("../../../services/types");
const types_2 = require("../../types");
const utils_1 = require("../utils");
const Koa = require("koa");
const types_3 = require("../types");
const http_1 = require("http");
const net_1 = require("net");
const app = new Koa();
const socket = new net_1.Socket();
const i = new http_1.IncomingMessage(socket);
const s = new http_1.ServerResponse(i);
describe('setHttpResponse', () => {
    it('should mutate ctx - set body', () => {
        const ctx = app.createContext(i, s);
        expect(ctx).toHaveProperty('body', undefined);
        const body = utils_1.defaultStringify({
            response: 'response',
        });
        utils_1.setHttpResponse(ctx)(types_3.HttpResponse.Ok(body));
        expect(ctx).toHaveProperty('body', body);
    });
    it('should mutate ctx - set status', () => {
        const ctx = app.createContext(i, s);
        expect(ctx).toHaveProperty('status', 200);
        utils_1.setHttpResponse(ctx)(types_3.HttpResponse.BadRequest());
        expect(ctx).toHaveProperty('status', 400);
    });
    it('should mutate ctx - set headers', () => {
        const ctx = app.createContext(i, s);
        expect(ctx).toHaveProperty(['response', 'headers']);
        utils_1.setHttpResponse(ctx)(types_3.HttpResponse.Ok(undefined, {
            customHeader: 'customHeaderResponse',
        }));
        expect(ctx).toHaveProperty(['response', 'headers', 'customheader'], 'customHeaderResponse');
    });
});
describe('contentTypeWithLSN', () => {
    it('should return Content-Type with Number LSN Format', () => {
        expect(utils_1.contentTypeWithLSN(types_2.LSNFormat.Number)).toBe('application/json; charset=utf-8');
    });
    it('should return Content-Type with String LSN Format', () => {
        expect(utils_1.contentTypeWithLSN(types_2.LSNFormat.String)).toBe(`application/json; charset=utf-8; ${utils_1.LSN_FORMAT_KEY}=${types_2.LSNFormat.String}`);
    });
});
describe('contentTypeWithMoneyFormat', () => {
    it('should return Content-Type with Float Money Format', () => {
        expect(utils_1.contentTypeWithMoneyFormat(types_1.MoneyFormat.Float)).toBe('application/json; charset=utf-8');
    });
    it('should return Content-Type with Long Money Format', () => {
        expect(utils_1.contentTypeWithMoneyFormat(types_1.MoneyFormat.Long)).toBe(`application/json; charset=utf-8; ${utils_1.MONEY_FORMAT_KEY}=${types_1.MoneyFormat.Long}`);
    });
});
describe('contentTypeWithLSNWithMoneyFormat', () => {
    it('should return Content-Type with Number LSN Format and Float Money Format', () => {
        expect(utils_1.contentTypeWithMoneyFormat(types_1.MoneyFormat.Float, utils_1.contentTypeWithLSN(types_2.LSNFormat.Number))).toBe('application/json; charset=utf-8');
    });
    it('should return Content-Type with Number LSN Format and Long Money Format', () => {
        expect(utils_1.contentTypeWithMoneyFormat(types_1.MoneyFormat.Long, utils_1.contentTypeWithLSN(types_2.LSNFormat.Number))).toBe(`application/json; charset=utf-8; ${utils_1.MONEY_FORMAT_KEY}=${types_1.MoneyFormat.Long}`);
    });
    it('should return Content-Type with String LSN Format and Float Money Format', () => {
        expect(utils_1.contentTypeWithMoneyFormat(types_1.MoneyFormat.Float, utils_1.contentTypeWithLSN(types_2.LSNFormat.String))).toBe(`application/json; charset=utf-8; ${utils_1.LSN_FORMAT_KEY}=${types_2.LSNFormat.String}`);
    });
    it('should return Content-Type with String LSN Format and Long Money Format', () => {
        expect(utils_1.contentTypeWithMoneyFormat(types_1.MoneyFormat.Long, utils_1.contentTypeWithLSN(types_2.LSNFormat.String))).toBe(`application/json; charset=utf-8; ${utils_1.LSN_FORMAT_KEY}=${types_2.LSNFormat.String}; ${utils_1.MONEY_FORMAT_KEY}=${types_1.MoneyFormat.Long}`);
    });
});
describe('parseMoney', () => {
    it('should return default money format, when money is not presented in headers', () => {
        expect(utils_1.parseMoneyFormat({})).toEqual(result_1.Ok(utils_1.DEFAULT_MONEY_FORMAT));
    });
    it('should parse money-format from headers', () => {
        expect(utils_1.parseMoneyFormat({
            accept: `${utils_1.MONEY_FORMAT_KEY}=${types_1.MoneyFormat.Float}`,
        })).toEqual(result_1.Ok(types_1.MoneyFormat.Float));
        expect(utils_1.parseMoneyFormat({
            accept: `${utils_1.MONEY_FORMAT_KEY}=${types_1.MoneyFormat.Long}`,
        })).toEqual(result_1.Ok(types_1.MoneyFormat.Long));
    });
    it('should return error on invalid decimals-header in headers', () => {
        expect(utils_1.parseMoneyFormat({
            accept: `${utils_1.MONEY_FORMAT_KEY}=wrong`,
        })).toEqual(result_1.Error(errorHandling_1.AppError.Parse('Invalid Money Format')));
    });
});
describe('parseLSN', () => {
    it('should return default lsn format, when lsn is not presented in headers', () => {
        expect(utils_1.parseLSNFormat({})).toEqual(result_1.Ok(utils_1.DEFAULT_LSN_FORMAT));
    });
    it('should parse lsn-format from headers', () => {
        expect(utils_1.parseLSNFormat({
            accept: `${utils_1.LSN_FORMAT_KEY}=${types_2.LSNFormat.Number}`,
        })).toEqual(result_1.Ok(types_2.LSNFormat.Number));
        expect(utils_1.parseLSNFormat({
            accept: `${utils_1.LSN_FORMAT_KEY}=${types_2.LSNFormat.String}`,
        })).toEqual(result_1.Ok(types_2.LSNFormat.String));
    });
    it('should return error on invalid decimals-format in headers', () => {
        expect(utils_1.parseLSNFormat({
            accept: `${utils_1.LSN_FORMAT_KEY}=bad lsn`,
        })).toEqual(result_1.Error(errorHandling_1.AppError.Parse('Invalid Large significand format')));
    });
});
describe('parseLSN and parseMoneyFormat simultaneously', () => {
    it('should parse lsn-format and money-fornat from headers', () => {
        const acceptHeaderValue = `${utils_1.LSN_FORMAT_KEY}=${types_2.LSNFormat.Number}; ${utils_1.MONEY_FORMAT_KEY}=${types_1.MoneyFormat.Long}`;
        expect(utils_1.parseLSNFormat({
            accept: acceptHeaderValue,
        })).toEqual(result_1.Ok(types_2.LSNFormat.Number));
        expect(utils_1.parseMoneyFormat({
            accept: acceptHeaderValue,
        })).toEqual(result_1.Ok(types_1.MoneyFormat.Long));
    });
});
//# sourceMappingURL=utils.test.js.map