"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { batalhaEdicaoApi } from "@/lib/api";
import { IBatalhaEdicao, EditionStatus } from "@/types/batalha";

const STATUS_CONFIG: Record<EditionStatus, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: "Rascunho",   color: "var(--muted-foreground)", bg: "rgba(160,160,160,0.1)" },
  OPEN:      { label: "Aberta",     color: "var(--success)",          bg: "rgba(74,222,128,0.1)" },
  RUNNING:   { label: "Em Curso",   color: "#facc15",                 bg: "rgba(250,204,21,0.1)" },
  FINISHED:  { label: "Finalizada", color: "var(--muted-foreground)", bg: "rgba(160,160,160,0.1)" },
  CANCELLED: { label: "Cancelada",  color: "var(--error)",            bg: "rgba(248,113,113,0.1)" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BatalhasPage() {
  const [edicoes, setEdicoes] = useState<IBatalhaEdicao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    batalhaEdicaoApi
      .getAll()
      .then((res) => {
        const data = res.data;
        // O backend pode retornar { batalhasEdicao: [...] } ou { data: [...] }
        const list: IBatalhaEdicao[] =
          data?.batalhasEdicao ?? data?.data ?? data ?? [];
        setEdicoes(list);
      })
      .catch(() => setError("Não foi possível carregar as batalhas."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Batalhas
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Todas as edições da BDR
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {error && !isLoading && (
        <div
          className="rounded-xl px-5 py-4 text-sm border"
          style={{
            background: "rgba(248,113,113,0.08)",
            borderColor: "var(--error)",
            color: "var(--error)",
          }}
        >
          {error}
        </div>
      )}

      {!isLoading && !error && edicoes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma edição encontrada.
          </p>
        </div>
      )}

      {!isLoading && edicoes.length > 0 && (
        <div className="flex flex-col gap-3">
          {edicoes.map((edicao) => {
            const status = STATUS_CONFIG[edicao.status] ?? STATUS_CONFIG.DRAFT;
            return (
              <Link
                key={edicao.id}
                href={`/dashboard/batalhas/${edicao.id}`}
                className="rounded-2xl p-5 border flex items-center justify-between gap-4 transition-colors hover:border-[var(--primary)]"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Status badge */}
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>
                      {edicao.name}
                    </p>
                    {edicao.season && (
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Temporada {edicao.season}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {edicao.startsAt && (
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {formatDate(edicao.startsAt)}
                      {edicao.endsAt && ` → ${formatDate(edicao.endsAt)}`}
                    </p>
                  )}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-auto mt-1"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
