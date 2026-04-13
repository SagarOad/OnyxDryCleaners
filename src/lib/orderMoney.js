/**
 * Money semantics for `Order` (matches `add-order` API):
 *
 * - `subtotal` is the **net order total**: sum(line item amounts) − discount + deliveryCharge.
 * - `deliveryCharge` and `discount` are stored again for breakdown only — do not add/subtract
 *   them again when deriving revenue from `subtotal`.
 * - `profit` is normally (subtotal − outsourcingCost) at creation; manual edits can diverge.
 */

export function orderLineRevenue(o) {
  if (o.subtotal != null && !Number.isNaN(Number(o.subtotal))) {
    return Number(o.subtotal);
  }
  const itemsSum = (o.items ?? []).reduce(
    (a, i) => a + (Number(i.amount) || 0),
    0
  );
  return (
    itemsSum -
    (Number(o.discount) || 0) +
    (Number(o.deliveryCharge) || 0)
  );
}

/** Net margin after outsourcing (same rule as new orders). */
export function orderNetProfitAfterOutsource(o) {
  return orderLineRevenue(o) - (Number(o.outsourcingCost) || 0);
}
