import AdminShell from "@/components/AdminShell";
import LedgerTableClient from "@/components/LedgerTableClient";

export default function LedgerPage() {
  return (
    <AdminShell title="General ledger">
      <LedgerTableClient />
    </AdminShell>
  );
}
