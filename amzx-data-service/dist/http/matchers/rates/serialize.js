"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const json_1 = require("../../../utils/json");
const types_2 = require("../../_common/types");
exports.serialize = (data, lsnFormat) => {
    if (!data.length) {
        return types_2.HttpResponse.NotFound();
    }
    else {
        return types_2.HttpResponse.Ok(json_1.stringify(lsnFormat)(types_1.list(data.map(r => types_1.rate({ rate: r.rate }, { amountAsset: r.amountAsset, priceAsset: r.priceAsset })))));
    }
};
//# sourceMappingURL=serialize.js.map