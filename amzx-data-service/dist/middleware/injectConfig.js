"use strict";
const compose = require('koa-compose');
const inject = require('./inject');
module.exports = (key, value) => {
    return compose([
        inject(['config', key], value)
    ]);
};
//# sourceMappingURL=injectConfig.js.map