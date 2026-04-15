export const RECEIPT_START = 1020;

export function formatReceiptNumber(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return "—";
  return String(Math.round(n)).padStart(6, "0");
}

export function getReceiptNumber(order) {
  if (order?.receiptNumber) return formatReceiptNumber(order.receiptNumber);
  if (!order?.id) return "—";
  return `RC-${String(order.id).slice(-6).toUpperCase()}`;
}

