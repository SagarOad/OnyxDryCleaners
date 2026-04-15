export function getReceiptNumber(order) {
  if (!order?.id) return "—";
  return `RC-${String(order.id).slice(-6).toUpperCase()}`;
}

