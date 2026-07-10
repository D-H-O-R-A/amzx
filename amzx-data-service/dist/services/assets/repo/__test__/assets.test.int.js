"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require('http');
const json_1 = require("../../../../utils/json");
const __1 = require("../");
// dependencies
const db_1 = require("../../../../db");
const loadConfig_1 = require("../../../../loadConfig");
const _common_1 = require("../../../_common");
const options = loadConfig_1.loadConfig();
const drivers = {
    pg: db_1.createPgDriver(options),
};
const cache = __1.createCache(10, 10000);
const repo = __1.default({
    drivers,
    emitEvent: () => () => null,
    cache,
});
const assetId = 'G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH';
describe('Assets repo', () => {
    describe('get', () => {
        it('fetches a real asset', (done) => __awaiter(void 0, void 0, void 0, function* () {
            repo
                .get(assetId)
                .run()
                .promise()
                .then((x) => {
                expect(x.unsafeGet()).toMatchSnapshot();
                done();
            })
                .catch(done.fail);
        }));
        it('returns null for unreal tx', () => __awaiter(void 0, void 0, void 0, function* () {
            const tx = yield repo
                .get('UNREAL')
                .run()
                .promise();
            expect(tx).toBeNothing();
        }));
    });
    describe('mget', () => {
        it('fetches real assets with nulls for unreal', (done) => __awaiter(void 0, void 0, void 0, function* () {
            repo
                .mget([assetId, 'UNREAL'])
                .run()
                .promise()
                .then((xs) => {
                expect(xs).toMatchSnapshot();
                done();
            })
                .catch((e) => done(JSON.stringify(e)));
        }));
    });
    describe('search', () => {
        it('fetches WAVES by ticker', (done) => __awaiter(void 0, void 0, void 0, function* () {
            repo
                .search({ ticker: 'WAVES', limit: 1, sort: _common_1.SortOrder.Descending })
                .run()
                .promise()
                .then((xs) => {
                expect(xs).toMatchSnapshot();
                done();
            })
                .catch((e) => done(JSON.stringify(e)));
        }));
        it('fetches non-WAVES asset by ticker (BTC)', (done) => __awaiter(void 0, void 0, void 0, function* () {
            http.get('http://nodes.wavesnodes.com/assets/details/8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS', (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    const assetInfoFromNode = json_1.parse(data);
                    repo
                        .search({ ticker: 'BTC', limit: 1, sort: _common_1.SortOrder.Descending })
                        .run()
                        .promise()
                        .then(xs => {
                        const assetInfo = xs.items[0];
                        if (assetInfo !== null) {
                            expect(assetInfo.description).toMatch(assetInfoFromNode.description);
                            expect(assetInfo.height.toString()).toMatch(assetInfoFromNode.issueHeight.toString());
                            expect(assetInfo.id).toMatch(assetInfoFromNode.assetId);
                            expect(assetInfo.name).toMatch(assetInfoFromNode.name);
                            expect(assetInfo.precision.toString()).toMatch(assetInfoFromNode.decimals.toString());
                            expect(assetInfo.quantity.toString()).toMatch(assetInfoFromNode.quantity.toString());
                            expect(assetInfo.reissuable.toString()).toMatch(assetInfoFromNode.reissuable.toString());
                            expect(assetInfo.sender).toMatch(assetInfoFromNode.issuer);
                            expect(assetInfo.ticker).toMatch('BTC');
                            done();
                        }
                        else {
                            done('Asset not found in Data Service');
                        }
                    });
                });
            });
        }));
        it('fetches all assets with tickers by ticker=*', () => repo
            .search({ ticker: '*', limit: 101, sort: _common_1.SortOrder.Descending })
            .run()
            .promise()
            .then(as => {
            expect(as.items.length).toBeGreaterThan(100);
            // make sure WAVES is included
            expect(as.items.find(a => a && a.ticker === 'WAVES')).not.toBeUndefined();
        }));
    });
});
//# sourceMappingURL=assets.test.int.js.map