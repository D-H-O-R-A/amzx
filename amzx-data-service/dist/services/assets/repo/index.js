"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const result_1 = require("folktale/result");
const tap_1 = require("../../../utils/tap");
const maybeOps_1 = require("../../../utils/fp/maybeOps");
// resolver creation and presets
const createResolver_1 = require("../../_common/createResolver");
const pg_1 = require("../../_common/presets/pg/getById/pg");
const pg_2 = require("../../_common/presets/pg/mgetByIds/pg");
const validation_1 = require("../../_common/presets/validation");
const transformResult_1 = require("../../_common/presets/pg/mgetByIds/transformResult");
const search_1 = require("../../_common/presets/pg/search");
// validation
const schema_1 = require("./schema");
const transformAsset_1 = require("./transformAsset");
const sql = require("./sql");
const cursor_1 = require("./cursor");
var cache_1 = require("./cache");
exports.createCache = cache_1.create;
exports.default = ({ drivers: { pg }, emitEvent, cache, }) => {
    const SERVICE_NAME = {
        GET: 'assets.get',
        MGET: 'assets.mget',
        SEARCH: 'assets.search',
    };
    return {
        get: createResolver_1.get({
            transformInput: result_1.Ok,
            getData: (req) => {
                return cache.get(req).matchWith({
                    Just: ({ value }) => task_1.of(maybe_1.of(value)),
                    Nothing: () => pg_1.getData({
                        name: SERVICE_NAME.GET,
                        sql: sql.get,
                        pg,
                    })(req).map(tap_1.tap((maybeResp) => maybeOps_1.forEach((x) => cache.set(req, x), maybeResp))),
                });
            },
            validateResult: validation_1.validateResult(schema_1.result, SERVICE_NAME.GET),
            transformResult: (res) => res.map(transformAsset_1.transformDbResponse),
            emitEvent,
        }),
        mget: createResolver_1.mget({
            transformInput: result_1.Ok,
            getData: (request) => {
                let results = request.map((x) => cache.get(x));
                const notCachedIndexes = results.reduce((acc, x, i) => {
                    if (maybeOps_1.isEmpty(x))
                        acc.push(i);
                    return acc;
                }, []);
                const notCachedAssetIdIndexes = {};
                notCachedIndexes.forEach((i) => {
                    if (Array.isArray(notCachedAssetIdIndexes[request[i]])) {
                        notCachedAssetIdIndexes[request[i]].push(i);
                    }
                    else {
                        notCachedAssetIdIndexes[request[i]] = [i];
                    }
                });
                return pg_2.getData({
                    name: SERVICE_NAME.MGET,
                    sql: sql.mget,
                    matchRequestResult: ramda_1.propEq('asset_id'),
                    pg,
                })(Object.keys(notCachedAssetIdIndexes)).map((fromDb) => {
                    fromDb.forEach(assetInfo => maybeOps_1.forEach((value) => {
                        Object.values(notCachedAssetIdIndexes[value.asset_id]).forEach(idx => {
                            results[idx] = assetInfo;
                        });
                        cache.set(value.asset_id, value);
                    }, assetInfo));
                    return results;
                });
            },
            validateResult: validation_1.validateResult(schema_1.result, SERVICE_NAME.MGET),
            transformResult: transformResult_1.transformResults(transformAsset_1.transformDbResponse),
            emitEvent,
        }),
        search: search_1.searchPreset({
            name: SERVICE_NAME.SEARCH,
            sql: sql.search,
            resultSchema: schema_1.result,
            transformResult: transformAsset_1.transformDbResponse,
            cursorSerialization: {
                serialize: cursor_1.serialize,
                deserialize: cursor_1.deserialize,
            },
        })({
            pg,
            emitEvent,
        }),
    };
};
//# sourceMappingURL=index.js.map