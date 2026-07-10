"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const ramda_adjunct_1 = require("ramda-adjunct");
const transformTxInfo_1 = require("../../_common/transformTxInfo");
const functionNameToPayload = (functionName) => functionName === null
    ? { type: 'transfer' }
    : {
        type: 'invocation',
        call: {
            function: functionName,
        },
    };
const bufferToETHHex = (b) => '0x' + b.toString('hex');
exports.default = ramda_1.compose(transformTxInfo_1.transformTxInfo, ramda_1.evolve({
    payload: functionNameToPayload,
    bytes: bufferToETHHex,
}), ramda_adjunct_1.renameKeys({ function_name: 'payload' }));
//# sourceMappingURL=transformTxInfo.js.map