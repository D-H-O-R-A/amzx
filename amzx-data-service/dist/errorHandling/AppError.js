"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJoiError = (err) => {
    return err && err.isJoi;
};
const ensureError = (e) => (e instanceof Error ? e : new Error(e));
function createErrorInfo(type, error, meta) {
    if (exports.isJoiError(meta)) {
        return {
            error,
            type,
            meta,
        };
    }
    else {
        return {
            error,
            type,
            meta,
        };
    }
}
// @todo more specific error types (e.g. resolver error is not informative about what really happened)
class AppError {
    static Db(error, meta) {
        return new DbError(error, meta);
    }
    static Init(error, meta) {
        return new InitError(error, meta);
    }
    static Resolver(error, meta) {
        return new ResolverError(error, meta);
    }
    static Validation(error, meta) {
        return new ValidationError(error, meta);
    }
    static Parse(error, meta) {
        return new ParseError(error, meta);
    }
    static Timeout(error, meta) {
        return new Timeout(error, meta);
    }
}
exports.AppError = AppError;
class InitError extends AppError {
    constructor(error, meta) {
        super();
        this.type = 'Init';
        this.error = ensureError(error);
        this.meta = meta;
    }
    matchWith(pattern) {
        return pattern.Init(createErrorInfo(this.type, this.error, this.meta));
    }
}
exports.InitError = InitError;
class ResolverError extends AppError {
    constructor(error, meta) {
        super();
        this.type = 'Resolver';
        this.error = ensureError(error);
        this.meta = meta;
    }
    matchWith(pattern) {
        return pattern.Resolver(this.meta === undefined
            ? createErrorInfo(this.type, this.error)
            : createErrorInfo(this.type, this.error, this.meta));
    }
}
exports.ResolverError = ResolverError;
class DbError extends AppError {
    constructor(error, meta) {
        super();
        this.type = 'Db';
        this.error = ensureError(error);
        this.meta = meta;
    }
    matchWith(pattern) {
        return pattern.Db(this.meta === undefined
            ? createErrorInfo(this.type, this.error)
            : createErrorInfo(this.type, this.error, this.meta));
    }
}
exports.DbError = DbError;
class ValidationError extends AppError {
    constructor(error, meta) {
        super();
        this.type = 'Validation';
        this.error = ensureError(error);
        this.meta = meta && meta.error && exports.isJoiError(meta.error) ? meta.error : meta;
    }
    matchWith(pattern) {
        return pattern.Validation(createErrorInfo(this.type, this.error, this.meta));
    }
}
exports.ValidationError = ValidationError;
class ParseError extends AppError {
    constructor(error, meta) {
        super();
        this.type = 'Parse';
        this.error = ensureError(error);
        this.meta = meta;
    }
    matchWith(pattern) {
        return pattern.Parse(this.meta === undefined
            ? createErrorInfo(this.type, this.error)
            : createErrorInfo(this.type, this.error, this.meta));
    }
}
exports.ParseError = ParseError;
class Timeout extends AppError {
    constructor(error, meta) {
        super();
        this.type = 'Timeout';
        this.error = ensureError(error);
        this.meta = meta;
    }
    matchWith(pattern) {
        return pattern.Timeout(this.meta === undefined
            ? createErrorInfo(this.type, this.error)
            : createErrorInfo(this.type, this.error, this.meta));
    }
}
exports.Timeout = Timeout;
//# sourceMappingURL=AppError.js.map