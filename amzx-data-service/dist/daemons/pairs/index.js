"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// configuration
const loadConfig_1 = require("./loadConfig");
const configuration = loadConfig_1.loadConfig();
// logger
const createLogger = require("../../logger/winston");
const logger = createLogger({
    logLevel: 'info',
});
// pg driver
const db_1 = require("../../db");
const pgDriver = db_1.createPgDriver(configuration);
const { daemon: runDaemon } = require('../presets/daemon');
const createDaemon = require('./create');
runDaemon(createDaemon({
    logger,
    pg: pgDriver,
    pairsTableName: 'pairs',
}, configuration), configuration, configuration.pairsUpdateInterval, configuration.pairsUpdateTimeout, logger);
//# sourceMappingURL=index.js.map