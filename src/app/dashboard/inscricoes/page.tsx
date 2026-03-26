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

export default function InscricoesPage() {
  const [edicoes, setEdicoes] = useState<IBatalhaEdicao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mostra edições abertas onde o usuário pode se inscrever
  useEffect(() => {
    batalhaEdicaoApi
      .getAll()
      .then((res) => {
        const data = res.data;
        const list: IBatalhaEdicao[] =
          data?.batalhasEdicao ?? data?.data ?? data ?? [];
        // Filtra apenas edições abertas
        setEdicoes(list.filter((e) => e.status === "OPEN"));
      })
      .catch(() => setError("Não foi possível carregar as batalhas abertas."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
          Inscrições
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Batalhas com inscrições abertas
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
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
        <div
          className="rounded-2xl p-10 border text-center"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(160,160,160,0.1)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
            Sem batalhas abertas
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            No momento não há batalhas com inscrições abertas.
          </p>
          <Link
            href="/dashboard/batalhas"
            className="inline-block mt-4 text-xs font-semibold hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Ver todas as edições →
          </Link>
        </div>
      )}

      {!isLoading && edicoes.length > 0 && (
        <div className="flex flex-col gap-3">
          {edicoes.map((edicao) => {
            const status = STATUS_CONFIG[edicao.status];
            return (
              <div
                key={edicao.id}
                className="rounded-2xl p-5 border flex items-center justify-between gap-4"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <div className="flex items-center gap-4 min-w-0">
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

                <Link
                  href={`/dashboard/batalhas/${edicao.id}`}
                  className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  Ver detalhes
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
