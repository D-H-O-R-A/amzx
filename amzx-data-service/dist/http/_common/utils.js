"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../errorHandling");
const json_1 = require("../../utils/json");
const types_1 = require("../../services/types");
const types_2 = require("../types");
exports.defaultStringify = json_1.stringify(types_2.LSNFormat.String);
exports.setHttpResponse = (ctx) => (httpResponse) => {
    ctx.body = httpResponse.body;
    ctx.status = httpResponse.status;
    if (httpResponse.headers) {
        ctx.set(httpResponse.headers);
    }
};
exports.LSN_FORMAT_KEY = 'large-significand-format';
exports.DEFAULT_LSN_FORMAT = types_2.LSNFormat.Number;
exports.MONEY_FORMAT_KEY = 'money-format';
exports.DEFAULT_MONEY_FORMAT = types_1.MoneyFormat.Float;
exports.parseLSNFormat = (httpHeaders) => {
    const acceptHeader = httpHeaders['accept'];
    if (typeof acceptHeader === 'string' &&
        acceptHeader.includes(exports.LSN_FORMAT_KEY)) {
        // lsn format param assuredly is string
        const lsnFormatParam = acceptHeader
            .split(';')
            .map((param) => param.trim())
            .find((param) => param.startsWith(exports.LSN_FORMAT_KEY));
        const lsnFormat = lsnFormatParam.substr(exports.LSN_FORMAT_KEY.length + 1 // + 1 cause the equal sign
        );
        if (![types_2.LSNFormat.Number, types_2.LSNFormat.String].includes(lsnFormat)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('Invalid Large significand format')));
        }
        else {
            return result_1.Ok(lsnFormat);
        }
    }
    else {
        return result_1.Ok(exports.DEFAULT_LSN_FORMAT);
    }
};
exports.contentTypeWithLSN = (lsnFormat, contentType = 'application/json; charset=utf-8') => `${contentType}${lsnFormat === types_2.LSNFormat.String
    ? `; ${exports.LSN_FORMAT_KEY}=${types_2.LSNFormat.String}`
    : ''}`;
exports.parseMoneyFormat = (httpHeaders) => {
    const acceptHeader = httpHeaders['accept'];
    if (typeof acceptHeader === 'string' &&
        acceptHeader.includes(exports.MONEY_FORMAT_KEY)) {
        // money format param assuredly is string
        const moneyFormatParam = acceptHeader
            .split(';')
            .map((param) => param.trim())
            .find((param) => param.startsWith(exports.MONEY_FORMAT_KEY));
        const moneyFormat = moneyFormatParam.substr(exports.MONEY_FORMAT_KEY.length + 1 // + 1 cause the equal sign
        );
        if (![types_1.MoneyFormat.Float, types_1.MoneyFormat.Long].includes(moneyFormat)) {
            return result_1.Error(new errorHandling_1.ParseError(new Error('Invalid Money Format')));
        }
        else {
            return result_1.Ok(moneyFormat);
        }
    }
    else {
        return result_1.Ok(exports.DEFAULT_MONEY_FORMAT);
    }
};
exports.contentTypeWithMoneyFormat = (moneyFormat, contentType = 'application/json; charset=utf-8') => `${contentType}${moneyFormat === types_1.MoneyFormat.Long
    ? `; ${exports.MONEY_FORMAT_KEY}=${types_1.MoneyFormat.Long}`
    : ''}`;
exports.withMatcher = (req) => 'matcher' in req && typeof req.matcher === 'string';
//# sourceMappingURL=utils.js.map