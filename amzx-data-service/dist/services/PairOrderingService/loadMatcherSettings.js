"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("https");
const Task = require("folktale/concurrency/task");
const errorHandling_1 = require("../../errorHandling");
const err = (matcherSettingsURL, originalError) => new errorHandling_1.InitError(`Unable to get matcher settings for ${matcherSettingsURL}. Please check the MATCHER_SETTINGS_URL env variable.`, { error: originalError });
exports.loadMatcherSettings = (matcherSettingsURL) => Task.task(({ resolve, reject }) => https_1.get(matcherSettingsURL, res => {
    let rawData = '';
    res.on('data', (chunk) => (rawData += chunk));
    res.on('end', () => {
        const settings = JSON.parse(rawData);
        resolve(settings);
    });
}).on('error', error => reject(err(matcherSettingsURL, error))));
//# sourceMappingURL=loadMatcherSettings.js.map