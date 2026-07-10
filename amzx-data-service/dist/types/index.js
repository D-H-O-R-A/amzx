"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_entities_1 = require("@waves/data-entities");
exports.AssetInfo = data_entities_1.Asset;
const serializable_1 = require("./serializable");
const interval_1 = require("./interval");
exports.interval = interval_1.interval;
exports.Unit = interval_1.Unit;
const list_1 = require("./list");
exports.list = list_1.list;
exports.fromMaybe = (factory) => (mb) => mb.matchWith({
    Just: ({ value }) => factory(value),
    Nothing: () => factory(),
});
exports.asset = (data = null) => serializable_1.toSerializable('asset', data);
exports.alias = (data) => serializable_1.toSerializable('alias', data);
exports.candle = (data = null) => serializable_1.toSerializable('candle', data);
var CandleInterval;
(function (CandleInterval) {
    CandleInterval["Minute1"] = "1m";
    CandleInterval["Minute5"] = "5m";
    CandleInterval["Minute15"] = "15m";
    CandleInterval["Minute30"] = "30m";
    CandleInterval["Hour1"] = "1h";
    CandleInterval["Hour2"] = "2h";
    CandleInterval["Hour3"] = "3h";
    CandleInterval["Hour4"] = "4h";
    CandleInterval["Hour6"] = "6h";
    CandleInterval["Hour12"] = "12h";
    CandleInterval["Day1"] = "1d";
    CandleInterval["Week1"] = "1w";
    CandleInterval["Month1"] = "1M";
})(CandleInterval = exports.CandleInterval || (exports.CandleInterval = {}));
exports.pair = (data, pairData) => (Object.assign(Object.assign({}, serializable_1.toSerializable('pair', data)), pairData));
// @todo TransactionInfo
var DataEntryType;
(function (DataEntryType) {
    DataEntryType["Binary"] = "binary";
    DataEntryType["Boolean"] = "boolean";
    DataEntryType["Integer"] = "integer";
    DataEntryType["String"] = "string";
})(DataEntryType = exports.DataEntryType || (exports.DataEntryType = {}));
exports.transaction = (data = null) => serializable_1.toSerializable('transaction', data);
exports.rate = (data, assetMeta) => (Object.assign(Object.assign({}, serializable_1.toSerializable('rate', data === null ? null : data)), assetMeta));
//# sourceMappingURL=index.js.map