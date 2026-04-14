"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function buildReminderMessage(name, amount) {
  return `Hi ${name}, this is a friendly reminder that your Onyx software subscription payment of Rs ${amount} is due. Please share payment confirmation.`;
}

export default function SuperAdminBillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    const res = await fetch("/api/superadmin/businesses");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load billing data");
    setBusinesses(data.businesses || []);
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "superadmin") {
      router.replace("/");
      return;
    }
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const rows = useMemo(
    () =>
      businesses.map((b) => {
        const latestSub = b.subscriptions?.[0];
        return {
          businessId: b.id,
          businessName: b.name,
          slug: b.slug,
          subscriptionId: latestSub?.id || null,
          monthlyAmount: Number(latestSub?.monthlyAmount ?? b.monthlyPayment ?? 0),
          paymentStatus: latestSub?.paymentStatus || b.paymentStatus || "unpaid",
          nextDueDate: latestSub?.nextDueDate || null,
          notes: latestSub?.notes || "",
        };
      }),
    [businesses]
  );

  const updateSubscription = async (row, patch) => {
    if (!row.subscriptionId) return;
    setSavingId(row.subscriptionId);
    setError("");
    try {
      const res = await fetch(`/api/superadmin/subscriptions/${row.subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update subscription");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const sendReminder = async (row) => {
    const msg = buildReminderMessage(row.businessName, row.monthlyAmount);
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      setError("Could not copy reminder to clipboard.");
    }
    const stamp = new Date().toISOString();
    const note = row.notes
      ? `${row.notes}\nReminder sent at ${stamp}`
      : `Reminder sent at ${stamp}`;
    await updateSubscription(row, {
      paymentStatus: row.paymentStatus === "paid" ? "paid" : "overdue",
      notes: note,
    });
  };

  if (status === "loading" || loading) {
    return (
      <AdminShell title="Billing">
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
      </AdminShell>
    );
  }
  if (!session || session.user.role !== "superadmin") return null;

  return (
    <AdminShell title="Billing and reminders">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">Business</th>
                <th className="px-3 py-2 text-left">Monthly amount</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Next due</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.businessId} className="border-t border-slate-200">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{row.businessName}</p>
                    <p className="text-xs text-slate-500">/{row.slug}</p>
                  </td>
                  <td className="px-3 py-3">Rs {row.monthlyAmount}</td>
                  <td className="px-3 py-3 capitalize">{row.paymentStatus}</td>
                  <td className="px-3 py-3">
                    {row.nextDueDate
                      ? new Date(row.nextDueDate).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateSubscription(row, { paymentStatus: "paid" })}
                        disabled={!row.subscriptionId || savingId === row.subscriptionId}
                        className="rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
                      >
                        Mark paid
                      </button>
                      <button
                        type="button"
                        onClick={() => sendReminder(row)}
                        disabled={!row.subscriptionId || savingId === row.subscriptionId}
                        className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 disabled:opacity-50"
                      >
                        Send reminder
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

