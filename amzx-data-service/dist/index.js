"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const Koa = require("koa");
const chalk_1 = require("chalk");
const createRequestId = require("koa-requestid");
const bodyParser = require("koa-bodyparser");
const koaQs_1 = require("./utils/koaQs");
const db_1 = require("./db");
const eventBus_1 = require("./eventBus/");
const createAndSubscribeLogger = require("./logger");
const services_1 = require("./services");
const injectConfig = require("./middleware/injectConfig");
const injectEventBus = require("./middleware/injectEventBus");
const accessLogMiddleware = require("./middleware/accessLog");
const cors = require('@koa/cors');
const loadConfig_1 = require("./loadConfig");
const http_2 = require("./http");
exports.WavesId = 'AMZX';
const app = koaQs_1.unsafeKoaQs(new Koa());
const options = loadConfig_1.loadConfig();
const eventBus = eventBus_1.default();
createAndSubscribeLogger({ options, eventBus });
const requestId = createRequestId({ expose: 'X-Request-Id', header: 'X-Request-Id' });
// @todo add the test sql query for the db availability checking
const pgDriver = db_1.createPgDriver(options);
services_1.default({
    options,
    pgDriver,
    emitEvent: (name) => (o) => eventBus.emit(name, o),
})
    .map((services) => app
    .use(bodyParser())
    .use(requestId)
    .use(cors())
    .use(injectEventBus(eventBus))
    .use(accessLogMiddleware)
    .use(injectConfig('defaultMatcher', options.matcher.defaultMatcherAddress))
    .use(http_2.default(services).routes()))
    .run()
    .listen({
    onResolved: app => {
        const server = http_1.createServer(app.callback());
        // should be smaller than headersTimeout (by default, 40s)
        server.keepAliveTimeout = 30 * 1000;
        server.listen(options.port);
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line
            console.log(chalk_1.default.yellow(`App has started on http://localhost:${options.port}/`));
        }
    },
    onRejected: (e) => {
        console.error(e);
    },
});
//# sourceMappingURL=index.js.map