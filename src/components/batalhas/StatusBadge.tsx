"use client";

import { BatalhaBaseStatus } from "@/types/batalha";

const STATUS_CONFIG: Record<
  BatalhaBaseStatus,
  { label: string; color: string; bg: string }
> = {
  PLANNED: { label: "Planejada", color: "#FFB400", bg: "rgba(255,180,0,0.12)" },
  RUNNING: {
    label: "Em Andamento",
    color: "#39FF14",
    bg: "rgba(57,255,20,0.1)",
  },
  FINISHED: {
    label: "Finalizada",
    color: "var(--muted-foreground)",
    bg: "rgba(75,75,75,0.3)",
  },
};

interface StatusBadgeProps {
  status: BatalhaBaseStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PLANNED;
  const padding = size === "md" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-block font-semibold rounded-full ${padding}`}
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}
