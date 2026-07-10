"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const aliases_1 = require("./aliases");
const repo_1 = require("./aliases/repo");
const assets_1 = require("./assets");
const repo_2 = require("./assets/repo");
const candles_1 = require("./candles");
const repo_3 = require("./candles/repo");
const pairs_1 = require("./pairs");
const repo_4 = require("./pairs/repo");
const all_1 = require("./transactions/all");
const repo_5 = require("./transactions/all/repo");
// alias txs
const alias_1 = require("./transactions/alias");
const repo_6 = require("./transactions/alias/repo");
// burn txs
const burn_1 = require("./transactions/burn");
const repo_7 = require("./transactions/burn/repo");
// data txs
const data_1 = require("./transactions/data");
const repo_8 = require("./transactions/data/repo");
// exchange txs
const exchange_1 = require("./transactions/exchange");
const repo_9 = require("./transactions/exchange/repo");
// genesis txs
const genesis_1 = require("./transactions/genesis");
const repo_10 = require("./transactions/genesis/repo");
// invoke script txs
const invokeScript_1 = require("./transactions/invokeScript");
const repo_11 = require("./transactions/invokeScript/repo");
// issue txs
const issue_1 = require("./transactions/issue");
const repo_12 = require("./transactions/issue/repo");
// lease txs
const lease_1 = require("./transactions/lease");
const repo_13 = require("./transactions/lease/repo");
// lease cancel txs
const leaseCancel_1 = require("./transactions/leaseCancel");
const repo_14 = require("./transactions/leaseCancel/repo");
// mass-transfer txs
const massTransfer_1 = require("./transactions/massTransfer");
const repo_15 = require("./transactions/massTransfer/repo");
// payment txs
const payment_1 = require("./transactions/payment");
const repo_16 = require("./transactions/payment/repo");
// reissue txs
const reissue_1 = require("./transactions/reissue");
const repo_17 = require("./transactions/reissue/repo");
// set asset script txs
const setAssetScript_1 = require("./transactions/setAssetScript");
const repo_18 = require("./transactions/setAssetScript/repo");
// set script txs
const setScript_1 = require("./transactions/setScript");
const repo_19 = require("./transactions/setScript/repo");
// sponsorship txs
const sponsorship_1 = require("./transactions/sponsorship");
const repo_20 = require("./transactions/sponsorship/repo");
// transfer txs
const transfer_1 = require("./transactions/transfer");
const repo_21 = require("./transactions/transfer/repo");
// update asset info txs
const updateAssetInfo_1 = require("./transactions/updateAssetInfo");
const repo_22 = require("./transactions/updateAssetInfo/repo");
// ethereum-like txs
const ethereumLike_1 = require("./transactions/ethereumLike");
const repo_23 = require("./transactions/ethereumLike/repo");
const rates_1 = require("./rates");
const ThresholdAssetRateService_1 = require("./rates/ThresholdAssetRateService");
const RemoteRateRepo_1 = require("./rates/repo/impl/RemoteRateRepo");
const PairOrderingService_1 = require("./PairOrderingService");
const pairs_2 = require("./_common/validation/pairs");
exports.default = ({ options, pgDriver, emitEvent, }) => {
    let matcherConfig = {};
    if (options.matcher.settingsURL) {
        matcherConfig[options.matcher.defaultMatcherAddress] = options.matcher.settingsURL;
    }
    // @todo async init whatever is necessary
    return PairOrderingService_1.PairOrderingServiceImpl.create(matcherConfig).map((pairOrderingService) => {
        // caches
        const ratesCache = new rates_1.RateCacheImpl(200000, 60000); // 1 minute
        const pairsCache = repo_4.createCache(1000, 5000);
        const assetsCache = repo_2.createCache(10000, 60000); // 1 minute
        const commonDeps = {
            drivers: {
                pg: pgDriver,
            },
            emitEvent,
        };
        // common init services
        const aliasesRepo = repo_1.default(commonDeps);
        const aliases = aliases_1.default(aliasesRepo);
        const assetsRepo = repo_2.default(Object.assign(Object.assign({}, commonDeps), { cache: assetsCache }));
        const assets = assets_1.default(assetsRepo);
        const pairsRepo = repo_4.default(Object.assign(Object.assign({}, commonDeps), { cache: pairsCache }));
        const pairsNoAsyncValidation = pairs_1.default(pairsRepo, () => task_1.of(undefined), assets);
        const pairsWithAsyncValidation = pairs_1.default(pairsRepo, (matcher, pairs) => pairs_2.validatePairs(assets.mget, pairOrderingService)(matcher, pairs), assets);
        const thresholdAssetRateService = new ThresholdAssetRateService_1.ThresholdAssetRateService(options.thresholdAssetId, options.matcher.defaultMatcherAddress, pairsNoAsyncValidation, emitEvent('log'));
        const aliasTxsRepo = repo_6.default(commonDeps);
        const aliasTxs = alias_1.default(aliasTxsRepo, assets);
        const burnTxsRepo = repo_7.default(commonDeps);
        const burnTxs = burn_1.default(burnTxsRepo, assets);
        const dataTxsRepo = repo_8.default(commonDeps);
        const dataTxs = data_1.default(dataTxsRepo, assets);
        const exchangeTxsRepo = repo_9.default(commonDeps);
        const exchangeTxs = exchange_1.default(exchangeTxsRepo, assets);
        const genesisTxsRepo = repo_10.default(commonDeps);
        const genesisTxs = genesis_1.default(genesisTxsRepo, assets);
        const invokeScriptTxsRepo = repo_11.default(commonDeps);
        const invokeScriptTxs = invokeScript_1.default(invokeScriptTxsRepo, assets);
        const issueTxsRepo = repo_12.default(commonDeps);
        const issueTxs = issue_1.default(issueTxsRepo, assets);
        const leaseTxsRepo = repo_13.default(commonDeps);
        const leaseTxs = lease_1.default(leaseTxsRepo, assets);
        const leaseCancelTxsRepo = repo_14.default(commonDeps);
        const leaseCancelTxs = leaseCancel_1.default(leaseCancelTxsRepo, assets);
        const massTransferTxsRepo = repo_15.default(commonDeps);
        const massTransferTxs = massTransfer_1.default(massTransferTxsRepo, assets);
        const paymentTxsRepo = repo_16.default(commonDeps);
        const paymentTxs = payment_1.default(paymentTxsRepo, assets);
        const reissueTxsRepo = repo_17.default(commonDeps);
        const reissueTxs = reissue_1.default(reissueTxsRepo, assets);
        const setAssetScriptTxsRepo = repo_18.default(commonDeps);
        const setAssetScriptTxs = setAssetScript_1.default(setAssetScriptTxsRepo, assets);
        const setScriptTxsRepo = repo_19.default(commonDeps);
        const setScriptTxs = setScript_1.default(setScriptTxsRepo, assets);
        const sponsorshipTxsRepo = repo_20.default(commonDeps);
        const sponsorshipTxs = sponsorship_1.default(sponsorshipTxsRepo, assets);
        const transferTxsRepo = repo_21.default(commonDeps);
        const transferTxs = transfer_1.default(transferTxsRepo, assets);
        const updateAssetInfoRepo = repo_22.default(commonDeps);
        const updateAssetInfoTxs = updateAssetInfo_1.default(updateAssetInfoRepo, assets);
        const ethereumLikeRepo = repo_23.default(commonDeps);
        const ethereumLikeTxs = ethereumLike_1.default(ethereumLikeRepo, assets);
        const rateRepo = new RemoteRateRepo_1.default(commonDeps.drivers.pg);
        const rates = rates_1.default(Object.assign(Object.assign({}, commonDeps), { repo: rateRepo, cache: ratesCache, assets, pairs: pairsNoAsyncValidation, pairAcceptanceVolumeThreshold: options.pairAcceptanceVolumeThreshold, thresholdAssetRateService: thresholdAssetRateService, baseAssetId: options.rateBaseAssetId }));
        const candlesRepo = repo_3.default(commonDeps);
        const candlesNoAsyncValidation = candles_1.default(candlesRepo, () => task_1.of(undefined), assets);
        const candlesWithAsyncValidation = candles_1.default(candlesRepo, (matcher, pairs) => pairs_2.validatePairs(assets.mget, pairOrderingService)(matcher, pairs), assets);
        // specific init services
        // all txs service
        const allTxsRepo = repo_5.default(commonDeps);
        const allTxs = all_1.default(allTxsRepo)({
            1: genesisTxs,
            2: paymentTxs,
            3: issueTxs,
            4: transferTxs,
            5: reissueTxs,
            6: burnTxs,
            7: exchangeTxs,
            8: leaseTxs,
            9: leaseCancelTxs,
            10: aliasTxs,
            11: massTransferTxs,
            12: dataTxs,
            13: setScriptTxs,
            14: sponsorshipTxs,
            15: setAssetScriptTxs,
            16: invokeScriptTxs,
            17: updateAssetInfoTxs,
            18: ethereumLikeTxs,
        });
        return {
            aliases,
            assets,
            candles: candlesNoAsyncValidation,
            pairs: pairsNoAsyncValidation,
            transactions: {
                all: allTxs,
                genesis: genesisTxs,
                payment: paymentTxs,
                issue: issueTxs,
                transfer: transferTxs,
                reissue: reissueTxs,
                burn: burnTxs,
                exchange: exchangeTxs,
                lease: leaseTxs,
                leaseCancel: leaseCancelTxs,
                alias: aliasTxs,
                massTransfer: massTransferTxs,
                data: dataTxs,
                setScript: setScriptTxs,
                sponsorship: sponsorshipTxs,
                setAssetScript: setAssetScriptTxs,
                invokeScript: invokeScriptTxs,
                updateAssetInfo: updateAssetInfoTxs,
                ethereumLike: ethereumLikeTxs,
            },
            matchers: {
                rates,
                candles: candlesWithAsyncValidation,
                pairs: pairsWithAsyncValidation,
            },
        };
    });
};
//# sourceMappingURL=index.js.map