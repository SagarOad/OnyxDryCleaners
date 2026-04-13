"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  ClipboardPlus,
  ListOrdered,
  Users,
  UserPlus,
  Package,
  PackagePlus,
  LogOut,
} from "lucide-react";

/** Single flat list — no grouped sections. */
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-order", label: "Add order", icon: ClipboardPlus },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/products", label: "Products", icon: Package },
  { href: "/add-product", label: "Add product", icon: PackagePlus },
  { href: "/customers", label: "Directory", icon: Users },
  { href: "/add-existing-customer", label: "Add customer", icon: UserPlus },
  { href: "/finance", label: "Finance", icon: LineChart },
  { href: "/ledger", label: "Ledger", icon: BookOpen },
];

function NavLink({ href, label, icon: Icon, active }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
          active
            ? "bg-sky-500/20 text-sky-300"
            : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const { data: session } = useSession();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <aside className="relative hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-xl md:flex">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
        <div className="shrink-0 px-5 pt-8 pb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30">
              <Package className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight">Onyx</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Operations
              </p>
            </div>
          </div>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-800/80 px-3 py-4">
          {session?.user?.email ? (
            <p
              className="mx-3 mb-3 truncate text-[11px] text-slate-500"
              title={session.user.email}
            >
              {session.user.email}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-500">
              <LogOut className="h-4 w-4" aria-hidden />
            </span>
            Sign out
          </button>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-md md:hidden">
        <div className="flex max-w-full gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[4.25rem] shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-sky-400"
                    : "text-slate-500 active:text-slate-300"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    active ? "bg-sky-500/20" : "bg-slate-800/80"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="max-w-[4.25rem] truncate text-center leading-tight">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-w-[4.25rem] shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-500 active:text-rose-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80">
              <LogOut className="h-4 w-4" aria-hidden />
            </span>
            <span className="max-w-[4.25rem] truncate text-center leading-tight">
              Out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
