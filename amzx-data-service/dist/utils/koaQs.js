"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require('merge-descriptors');
const qs = require('qs');
/**
 * Replicates logic from koa-qs module but with
 * modern dependencies versions.
 * MUTATES the provided Koa app object
 * @param app Koa app, mutable
 */
function unsafeKoaQs(app) {
    merge(app.request, {
        /**
         * Get parsed query-string.
         *
         * @return {Object}
         * @api public
         */
        get query() {
            var str = this.querystring;
            if (!str)
                return {};
            var c = (this._querycache = this._querycache || {});
            var query = c[str];
            if (!query) {
                c[str] = query = qs.parse(str);
            }
            return query;
        },
        /**
         * Set query-string as an object.
         *
         * @param {Object} obj
         * @api public
         */
        set query(obj) {
            this.querystring = qs.stringify(obj);
        },
    });
    return app;
}
exports.unsafeKoaQs = unsafeKoaQs;
//# sourceMappingURL=koaQs.js.map