"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkEnv = require("check-env");
const ramda_1 = require("ramda");
const commonEnvVariables = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
exports.loadDefaultConfig = () => {
    // assert common env vars are set
    checkEnv(commonEnvVariables);
    return {
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        postgresHost: process.env.PGHOST || '',
        postgresPort: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
        postgresDatabase: process.env.PGDATABASE || 'mainnet',
        postgresUser: process.env.PGUSER || 'postgres',
        postgresPassword: process.env.PGPASSWORD || 'postgres',
        postgresPoolSize: process.env.PGPOOLSIZE ? parseInt(process.env.PGPOOLSIZE) : 20,
        postgresStatementTimeout: ramda_1.isNil(process.env.PGSTATEMENTTIMEOUT) ||
            isNaN(parseInt(process.env.PGSTATEMENTTIMEOUT))
            ? false
            : parseInt(process.env.PGSTATEMENTTIMEOUT),
        logLevel: process.env.LOG_LEVEL || 'info',
    };
};
const envVariables = [
    'DEFAULT_MATCHER',
    'RATE_PAIR_ACCEPTANCE_VOLUME_THRESHOLD',
    'RATE_THRESHOLD_ASSET_ID',
];
const ensurePositiveNumber = (x, msg) => {
    if (x > 0) {
        return x;
    }
    throw new Error(msg);
};
const load = () => {
    // assert all necessary env vars are set
    checkEnv(envVariables);
    const matcher = {
        matcher: {
            defaultMatcherAddress: process.env.DEFAULT_MATCHER,
        },
    };
    const volumeThreshold = ensurePositiveNumber(parseInt(process.env.RATE_PAIR_ACCEPTANCE_VOLUME_THRESHOLD), 'RATE_PAIR_ACCEPTANCE_VOLUME_THRESHOLD environment variable should be a positive integer');
    const rate = {
        pairAcceptanceVolumeThreshold: volumeThreshold,
        thresholdAssetId: process.env.RATE_THRESHOLD_ASSET_ID,
        rateBaseAssetId: process.env.RATE_BASE_ASSET_ID || 'WAVES',
    };
    if (typeof process.env.MATCHER_SETTINGS_URL !== 'undefined' &&
        process.env.MATCHER_SETTINGS_URL !== '') {
        matcher.matcher.settingsURL = process.env.MATCHER_SETTINGS_URL;
    }
    return Object.assign(Object.assign(Object.assign({}, exports.loadDefaultConfig()), matcher), rate);
};
exports.loadConfig = ramda_1.memoizeWith(ramda_1.always('config'), load);
//# sourceMappingURL=loadConfig.js.map