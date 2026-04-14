"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, CreditCard, ReceiptText, AlertTriangle } from "lucide-react";

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "superadmin") {
      router.replace("/");
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/superadmin/businesses");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load businesses");
        setBusinesses(data.businesses || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <AdminShell title="Superadmin">
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
      </AdminShell>
    );
  }

  if (!session || session.user.role !== "superadmin") return null;

  const totalBusinesses = businesses.length;
  const totalMonthly = businesses.reduce(
    (sum, b) => sum + Number(b.subscriptions?.[0]?.monthlyAmount ?? b.monthlyPayment ?? 0),
    0
  );
  const unpaidCount = businesses.filter(
    (b) => (b.subscriptions?.[0]?.paymentStatus || b.paymentStatus) !== "paid"
  ).length;
  const totalOrders = businesses.reduce((sum, b) => sum + (b._count?.orders || 0), 0);

  return (
    <AdminShell title="Superadmin dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Businesses",
            value: totalBusinesses,
            icon: Building2,
          },
          {
            label: "Monthly recurring (Rs)",
            value: new Intl.NumberFormat("en-PK").format(Math.round(totalMonthly)),
            icon: CreditCard,
          },
          {
            label: "Unpaid / overdue",
            value: unpaidCount,
            icon: AlertTriangle,
          },
          {
            label: "Total orders",
            value: totalOrders,
            icon: ReceiptText,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">{card.label}</p>
              <card.icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/superadmin/businesses"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Create/manage businesses
            </Link>
            <Link
              href="/superadmin/billing"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Billing and reminders
            </Link>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Latest businesses
          </h2>
          <div className="mt-4 space-y-3">
            {businesses.slice(0, 5).map((b) => (
              <div key={b.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">{b.name}</p>
                <p className="text-xs text-slate-500">/{b.slug}</p>
              </div>
            ))}
            {businesses.length === 0 ? (
              <p className="text-sm text-slate-500">No businesses yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

