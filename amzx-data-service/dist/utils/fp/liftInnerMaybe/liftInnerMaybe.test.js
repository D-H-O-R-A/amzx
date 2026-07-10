"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const result_1 = require("folktale/result");
const _1 = require(".");
const validationLeftValue = result_1.Error('Bad value');
const mockValidate = (r) => r === 1 ? result_1.of(r) : validationLeftValue;
test('liftInnerM', () => {
    const validateMaybeV = (m) => _1.liftInnerMaybe(result_1.of, mockValidate, m);
    expect(validateMaybeV(maybe_1.of(1))).toEqual(result_1.of(maybe_1.of(1)));
    expect(validateMaybeV(maybe_1.of(2))).toEqual(validationLeftValue);
});
//# sourceMappingURL=liftInnerMaybe.test.js.map