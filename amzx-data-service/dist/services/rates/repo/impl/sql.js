"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const types_1 = require("../../../../types");
exports.default = (tuplesCount) => `
select
  p.amount_asset_id,
  p.price_asset_id,
  p.matcher,
  (select floor(sum(wap.weighted_average_price * wap.volume) / sum(wap.volume)) from 
   (
     select weighted_average_price, volume
     from candles
     where
       amount_asset_id = p.amount_asset_id
       and price_asset_id = p.price_asset_id
       and matcher_address = p.matcher
       and interval = '${types_1.CandleInterval.Minute1}'
       and volume > 0
       and time_start < ?
       order by time_start desc
     limit 5) as wap
  ) weighted_average_price
from (
  select distinct 
    c.amount_asset_id,
    c.price_asset_id,
    c.matcher_address as matcher
  from candles c
  where
    c.interval = '${types_1.CandleInterval.Day1}'
    and c.matcher_address = ?
    and (c.amount_asset_id, c.price_asset_id) in (${ramda_1.repeat('(?, ?)', tuplesCount)})
  order by c.amount_asset_id, c.price_asset_id, c.matcher_address
) as p;
`;
//# sourceMappingURL=sql.js.map