"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_adjunct_1 = require("ramda-adjunct");
const ramda_1 = require("ramda");
const hasNullSig = ramda_1.propEq('signature', null);
const hasZeroProofs = ramda_1.pathEq(['proofs', 'length'], 0);
const processProofsAndSignature = ramda_1.ifElse(hasNullSig, ramda_1.omit(['signature']), ramda_1.ifElse(hasZeroProofs, ramda_1.omit(['proofs']), ramda_1.identity));
/** transformTxInfo:: RawTxInfo -> TxInfo */
exports.transformTxInfo = ramda_1.compose(processProofsAndSignature, 
// remove version if it is null
ramda_1.ifElse(ramda_1.propEq('version', null), ramda_1.omit(['version']), ramda_1.identity), ramda_adjunct_1.renameKeys({
    tx_type: 'type',
    tx_version: 'version',
    sender_public_key: 'senderPublicKey',
    time_stamp: 'timestamp',
    status: 'applicationStatus',
}), ramda_1.omit(['uid']));
//# sourceMappingURL=transformTxInfo.js.map