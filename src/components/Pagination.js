import React, { useMemo, useState } from "react";

const baseButton =
  "rounded-md px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) {
  const [jump, setJump] = useState("");

  const safeTotal = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, currentPage || 1), safeTotal);

  const pages = useMemo(() => {
    if (safeTotal <= 7) {
      return Array.from({ length: safeTotal }, (_, i) => i + 1);
    }
    if (safePage <= 3) return [1, 2, 3, 4, "...", safeTotal];
    if (safePage >= safeTotal - 2) {
      return [1, "...", safeTotal - 3, safeTotal - 2, safeTotal - 1, safeTotal];
    }
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", safeTotal];
  }, [safePage, safeTotal]);

  const go = (page) => {
    if (disabled) return;
    const target = Math.min(Math.max(1, page), safeTotal);
    if (target !== safePage) onPageChange(target);
  };

  const submitJump = () => {
    const target = parseInt(jump, 10);
    if (!Number.isNaN(target)) go(target);
  };

  if (safeTotal <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => go(1)}
        disabled={disabled || safePage === 1}
        className={`${baseButton} bg-slate-200 text-slate-800 hover:bg-slate-300`}
      >
        First
      </button>
      <button
        type="button"
        onClick={() => go(safePage - 1)}
        disabled={disabled || safePage === 1}
        className={`${baseButton} bg-slate-200 text-slate-800 hover:bg-slate-300`}
      >
        Previous
      </button>

      {pages.map((item, idx) =>
        item === "..." ? (
          <span key={`dots-${idx}`} className="px-1 text-sm text-slate-500">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            disabled={disabled}
            className={`${baseButton} ${
              item === safePage
                ? "bg-slate-800 text-white"
                : "bg-slate-200 text-slate-800 hover:bg-slate-300"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => go(safePage + 1)}
        disabled={disabled || safePage === safeTotal}
        className={`${baseButton} bg-slate-200 text-slate-800 hover:bg-slate-300`}
      >
        Next
      </button>
      <button
        type="button"
        onClick={() => go(safeTotal)}
        disabled={disabled || safePage === safeTotal}
        className={`${baseButton} bg-slate-200 text-slate-800 hover:bg-slate-300`}
      >
        Last
      </button>

      <div className="ml-1 flex items-center gap-2">
        <span className="text-sm text-slate-600">
          Page {safePage} of {safeTotal}
        </span>
        <input
          type="number"
          min={1}
          max={safeTotal}
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitJump();
          }}
          placeholder="Go"
          className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={submitJump}
          disabled={disabled}
          className={`${baseButton} bg-slate-800 text-white hover:bg-slate-700`}
        >
          Go
        </button>
      </div>
    </div>
  );
}
