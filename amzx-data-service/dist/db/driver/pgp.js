"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const pgPromise = require("pg-promise");
const bigNumber_1 = require("../../utils/bigNumber");
const pgp = pgPromise();
const parsePgArray = ramda_1.compose(ramda_1.split(','), ramda_1.init, ramda_1.tail);
const toBigNumberAll = (s) => parsePgArray(s).map(bigNumber_1.toBigNumber);
const types = pgp.pg.types;
types.setTypeParser(20, bigNumber_1.toBigNumber); // bigint
types.setTypeParser(701, bigNumber_1.toBigNumber); // double precision/float8
types.setTypeParser(1700, bigNumber_1.toBigNumber); // numeric
types.setTypeParser(1016, toBigNumberAll); // array/bigint
types.setTypeParser(1022, toBigNumberAll); // array/double precision
types.setTypeParser(1231, toBigNumberAll); // array/numeric
// @hack
// for some reason float4/real does not matter to pg-promise
// as it seems to parse it with 'double precision' parser anyway
// If they change it upstream, our integration test will fail and indicate.
// types.setTypeParser(700, toBigNumber); // real/float4
// types.setTypeParser(1021, toBigNumberAll); // array/float
exports.pgpConnect = pgp;
//# sourceMappingURL=pgp.js.map