"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS = {
  "/": "Dashboard",
  "/finance": "Finance",
  "/ledger": "General ledger",
  "/add-order": "Add order",
  "/orders": "Orders",
  "/customers": "Customers",
  "/add-existing-customer": "Add customer",
  "/products": "Products",
  "/add-product": "Add product",
  "/superadmin": "Superadmin",
  "/superadmin/businesses": "Businesses",
  "/superadmin/billing": "Billing",
};

export default function Breadcrumbs() {
  const pathname = usePathname() || "/";
  if (pathname === "/login") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ href: "/", label: LABELS["/"] || "Home" }];

  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({
      href: acc,
      label: LABELS[acc] || seg.replace(/-/g, " "),
    });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-600"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <Home className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">Home</span>
      </Link>
      {crumbs.slice(1).map((c, i, arr) => {
        const isLast = i === arr.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {isLast ? (
              <span
                className="max-w-[200px] truncate font-medium text-slate-900 md:max-w-none"
                aria-current="page"
              >
                {typeof c.label === "string" ? c.label : String(c.label)}
              </span>
            ) : (
              <Link
                href={c.href}
                className="rounded-md px-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
