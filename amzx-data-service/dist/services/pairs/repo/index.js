"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const result_1 = require("folktale/result");
const maybeOps_1 = require("../../../utils/fp/maybeOps");
const tap_1 = require("../../../utils/tap");
// resolver creation and presets
const createResolver_1 = require("../../_common/createResolver");
const pg_1 = require("../../_common/presets/pg/getById/pg");
const validation_1 = require("../../_common/presets/validation");
const search_1 = require("../../_common/presets/pg/search");
// service logic
var cache_1 = require("./cache");
exports.createCache = cache_1.create;
const cursor_1 = require("./cursor");
const matchRequestResult_1 = require("./matchRequestResult");
const mgetPairsPg_1 = require("./mgetPairsPg");
const schema_1 = require("./schema");
const transformResult_1 = require("./transformResult");
const sql = require("./sql");
exports.default = ({ drivers, emitEvent, cache, }) => {
    const SERVICE_NAME = {
        GET: 'pairs.get',
        MGET: 'pairs.mget',
        SEARCH: 'pairs.search',
    };
    const get = createResolver_1.get({
        transformInput: result_1.Ok,
        // cache first
        getData: (req) => cache.get(req).matchWith({
            Just: ({ value }) => task_1.of(maybe_1.of(value)),
            Nothing: () => pg_1.getData({
                name: SERVICE_NAME.GET,
                sql: sql.get,
                pg: drivers.pg,
            })(req).map(tap_1.tap((maybeResp) => maybeOps_1.forEach((x) => cache.set(req, x), maybeResp))),
        }),
        validateResult: validation_1.validateResult(schema_1.result, SERVICE_NAME.GET),
        transformResult: (res) => res.map(transformResult_1.transformResult),
        emitEvent,
    });
    const mget = createResolver_1.mget({
        transformInput: result_1.Ok,
        getData: (request) => {
            let results = request.pairs.map((p) => cache.get({
                pair: p,
                matcher: request.matcher,
            }));
            const notCachedIndexes = results.reduce((acc, x, i) => {
                if (maybeOps_1.isEmpty(x))
                    acc.push(i);
                return acc;
            }, []);
            const notCachedPairs = notCachedIndexes.map((i) => request.pairs[i]);
            return mgetPairsPg_1.mgetPairsPg({
                name: SERVICE_NAME.MGET,
                sql: sql.mget,
                matchRequestResult: matchRequestResult_1.matchRequestResult,
                pg: drivers.pg,
            })({
                pairs: notCachedPairs,
                matcher: request.matcher,
            }).map((pairsFromDb) => {
                pairsFromDb.forEach((pair, index) => maybeOps_1.forEach((p) => {
                    results[notCachedIndexes[index]] = pair;
                    cache.set({
                        matcher: request.matcher,
                        pair: notCachedPairs[index],
                    }, p);
                }, pair));
                return results;
            });
        },
        validateResult: validation_1.validateResult(schema_1.result, SERVICE_NAME.MGET),
        transformResult: (res) => res.map((m, i) => m.map(transformResult_1.transformResult)),
        emitEvent,
    });
    const search = search_1.searchPreset({
        name: SERVICE_NAME.SEARCH,
        sql: sql.search,
        resultSchema: schema_1.result,
        transformResult: transformResult_1.transformResult,
        cursorSerialization: {
            serialize: cursor_1.serialize,
            deserialize: cursor_1.deserialize,
        },
    })({
        pg: drivers.pg,
        emitEvent,
    });
    return {
        get,
        mget,
        search,
    };
};
//# sourceMappingURL=index.js.map