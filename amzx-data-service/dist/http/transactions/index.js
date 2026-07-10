"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const filters_1 = require("../_common/filters/filters");
const _common_1 = require("./_common");
const parseDataMgetOrSearch_1 = require("./parseDataMgetOrSearch");
const createParseRequest = (customFilters = {}) => ({
    get: _common_1.parseGet,
    mgetOrSearch: _common_1.parseMgetOrSearch(customFilters),
});
const subrouter = new Router();
exports.default = (txsServices) => {
    const all = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/all', txsServices.all, createParseRequest());
    const genesis = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/genesis', txsServices.genesis, createParseRequest({
        recipient: filters_1.default.query,
    }));
    const payment = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/payment', txsServices.payment, createParseRequest({
        recipient: filters_1.default.query,
    }));
    const issue = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/issue', txsServices.issue, createParseRequest({
        assetId: filters_1.default.query,
        script: filters_1.default.query,
    }));
    const transfer = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/transfer', txsServices.transfer, createParseRequest({
        assetId: filters_1.default.query,
        recipient: filters_1.default.query,
    }));
    const reissue = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/reissue', txsServices.reissue, createParseRequest({
        assetId: filters_1.default.query,
    }));
    const burn = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/burn', txsServices.burn, createParseRequest({
        assetId: filters_1.default.query,
    }));
    const exchange = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/exchange', txsServices.exchange, createParseRequest({
        amountAsset: filters_1.default.query,
        matcher: filters_1.default.query,
        orderId: filters_1.default.query,
        priceAsset: filters_1.default.query,
    }));
    const lease = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/lease', txsServices.lease, createParseRequest({
        recipient: filters_1.default.query,
    }));
    const leaseCancel = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/lease-cancel', txsServices.leaseCancel, createParseRequest({
        recipient: filters_1.default.query,
    }));
    const alias = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/alias', txsServices.alias, createParseRequest());
    const massTransfer = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/mass-transfer', txsServices.massTransfer, createParseRequest({
        assetId: filters_1.default.query,
        recipient: filters_1.default.query,
    }));
    const data = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/data', txsServices.data, {
        get: _common_1.parseGet,
        mgetOrSearch: parseDataMgetOrSearch_1.parseDataMgetOrSearch,
    });
    const setScript = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/set-script', txsServices.setScript, createParseRequest({
        script: filters_1.default.query,
    }));
    const sponsorship = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/sponsorship', txsServices.sponsorship, createParseRequest({
        assetId: filters_1.default.query,
    }));
    const setAssetScript = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/set-asset-script', txsServices.setAssetScript, createParseRequest({
        assetId: filters_1.default.query,
        script: filters_1.default.query,
    }));
    const invokeScript = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/invoke-script', txsServices.invokeScript, createParseRequest({
        dapp: filters_1.default.query,
        function: filters_1.default.query,
    }));
    const updateAssetInfo = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/update-asset-info', txsServices.updateAssetInfo, createParseRequest({
        assetId: filters_1.default.query,
    }));
    const ethereumLike = _common_1.createTransactionHttpHandlers(new Router(), '/transactions/ethereum-like', txsServices['ethereumLike'], createParseRequest({
        type: filters_1.default.query,
        function: filters_1.default.query,
    }));
    return subrouter.use(alias.routes(), all.routes(), burn.routes(), data.routes(), exchange.routes(), genesis.routes(), invokeScript.routes(), issue.routes(), lease.routes(), leaseCancel.routes(), massTransfer.routes(), payment.routes(), reissue.routes(), setAssetScript.routes(), setScript.routes(), sponsorship.routes(), transfer.routes(), updateAssetInfo.routes(), ethereumLike.routes());
};
//# sourceMappingURL=index.js.map