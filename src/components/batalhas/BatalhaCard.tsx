"use client";

import Link from "next/link";
import { IBatalhaBase } from "@/types/batalha";
import StatusBadge from "./StatusBadge";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const CHAVEAMENTO_LABEL: Record<string, string> = {
  SINGLE: "Simples",
  DOUBLE: "Duplo",
  TRIPLE: "Triplo",
};

interface BatalhaCardProps {
  batalha: IBatalhaBase;
  onDelete?: (id: string) => void;
}

export default function BatalhaCard({ batalha, onDelete }: BatalhaCardProps) {
  return (
    <div
      className="rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--primary)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--card-border)")
      }
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p
            className="font-semibold text-sm"
            style={{ color: "var(--foreground)" }}
          >
            {batalha.name}
          </p>
          {batalha.status && <StatusBadge status={batalha.status} />}
        </div>

        {batalha.description && (
          <p
            className="text-xs truncate max-w-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            {batalha.description}
          </p>
        )}

        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          {batalha.city && batalha.state
            ? `${batalha.city} — ${batalha.state}`
            : batalha.address}
        </p>

        <div className="flex flex-wrap gap-3 mt-2">
          {batalha.chaveamentoType && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: "rgba(230,57,70,0.1)",
                color: "var(--primary)",
              }}
            >
              {CHAVEAMENTO_LABEL[batalha.chaveamentoType]}
            </span>
          )}
          {batalha.maxMcs != null && (
            <span
              className="text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              Máx {batalha.maxMcs} MCs
            </span>
          )}
          {batalha.numJudges != null && (
            <span
              className="text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              {batalha.numJudges} jurado{batalha.numJudges !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <p
          className="text-xs hidden sm:block"
          style={{ color: "var(--muted-foreground)" }}
        >
          {formatDate(batalha.createdAt)}
        </p>

        <Link
          href={`/dashboard/batalhas/${batalha.id}`}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          style={{
            background: "rgba(230,57,70,0.12)",
            color: "var(--primary)",
          }}
          title="Visualizar"
        >
          Ver
        </Link>

        <Link
          href={`/dashboard/batalhas/criar?id=${batalha.id}`}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          style={{
            background: "rgba(160,160,160,0.1)",
            color: "var(--muted-foreground)",
          }}
          title="Editar"
        >
          Editar
        </Link>

        {onDelete && (
          <button
            onClick={() => onDelete(batalha.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={{
              background: "rgba(248,113,113,0.1)",
              color: "var(--error)",
            }}
            title="Deletar"
          >
            Deletar
          </button>
        )}
      </div>
    </div>
  );
}
