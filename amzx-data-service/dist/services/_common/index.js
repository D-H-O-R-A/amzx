"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SortOrder;
(function (SortOrder) {
    SortOrder["Ascending"] = "asc";
    SortOrder["Descending"] = "desc";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
exports.isSortOrder = (raw) => [SortOrder.Ascending, SortOrder.Descending].includes(raw);
//# sourceMappingURL=index.js.map