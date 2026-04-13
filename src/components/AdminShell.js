import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";

export default function AdminShell({ title, children }) {
  return (
    <div className="flex h-screen min-h-0 bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full min-w-0 max-w-[1920px] p-4 md:p-6">
            <Breadcrumbs />
            {title ? (
              <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 md:mb-6">
                {title}
              </h1>
            ) : null}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
