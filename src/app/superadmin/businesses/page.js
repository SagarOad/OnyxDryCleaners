"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const initialForm = {
  businessName: "",
  slug: "",
  ownerUsername: "",
  ownerPassword: "",
  ownerEmail: "",
  monthlyAmount: "",
  notes: "",
};

export default function SuperAdminBusinessesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/superadmin/businesses");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load businesses");
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

  const createBusiness = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/superadmin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monthlyAmount: form.monthlyAmount ? Number(form.monthlyAmount) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create business");
      setForm(initialForm);
      await load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminShell title="Businesses">
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
      </AdminShell>
    );
  }
  if (!session || session.user.role !== "superadmin") return null;

  return (
    <AdminShell title="Businesses">
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={createBusiness}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Create business tenant
          </h2>
          <div className="grid gap-3">
            {[
              ["businessName", "Business name", "text"],
              ["slug", "Slug (optional)", "text"],
              ["ownerUsername", "Owner username", "text"],
              ["ownerPassword", "Owner password", "password"],
              ["ownerEmail", "Owner email (optional)", "text"],
              ["monthlyAmount", "Monthly payment (PKR)", "number"],
            ].map(([k, label, type]) => (
              <label key={k} className="text-sm font-medium text-slate-700">
                {label}
                <input
                  type={type}
                  value={form[k]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [k]: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  required={["businessName", "ownerUsername", "ownerPassword"].includes(
                    k
                  )}
                />
              </label>
            ))}
            <label className="text-sm font-medium text-slate-700">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create business"}
            </button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Registered businesses
          </h2>
          <div className="space-y-3">
            {businesses.map((b) => {
              const latestSub = b.subscriptions?.[0];
              return (
                <div
                  key={b.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="font-semibold text-slate-900">{b.name}</p>
                  <p className="text-xs text-slate-500">/{b.slug}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Owner users: {b.users?.length || 0} · Orders:{" "}
                    {b._count?.orders || 0}
                  </p>
                  <p className="text-sm text-slate-700">
                    Monthly: Rs {latestSub?.monthlyAmount ?? b.monthlyPayment}
                  </p>
                </div>
              );
            })}
            {businesses.length === 0 ? (
              <p className="text-sm text-slate-500">No businesses yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

