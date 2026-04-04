"use client";

import { BatalhaBaseStatus } from "@/types/batalha";

const STATUS_OPTIONS: { value: BatalhaBaseStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PLANNED", label: "Planejada" },
  { value: "RUNNING", label: "Em Andamento" },
  { value: "FINISHED", label: "Finalizada" },
];

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: BatalhaBaseStatus | "ALL";
  onStatusChange: (value: BatalhaBaseStatus | "ALL") => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar batalha..."
          className="w-full pl-8 pr-4 py-2 rounded-xl border text-sm"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              background:
                statusFilter === opt.value
                  ? "var(--primary)"
                  : "var(--input-bg)",
              color:
                statusFilter === opt.value
                  ? "#fff"
                  : "var(--muted-foreground)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor:
                statusFilter === opt.value
                  ? "var(--primary)"
                  : "var(--input-border)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
