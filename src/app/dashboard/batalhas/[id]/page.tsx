"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { batalhaEdicaoApi, batalhaPartidaApi } from "@/lib/api";
import { IBatalhaEdicao, IBatalhaPartida, MatchStatus } from "@/types/batalha";

const EDITION_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: "Rascunho",   color: "var(--muted-foreground)", bg: "rgba(160,160,160,0.1)" },
  OPEN:      { label: "Aberta",     color: "var(--success)",          bg: "rgba(74,222,128,0.1)" },
  RUNNING:   { label: "Em Curso",   color: "#facc15",                 bg: "rgba(250,204,21,0.1)" },
  FINISHED:  { label: "Finalizada", color: "var(--muted-foreground)", bg: "rgba(160,160,160,0.1)" },
  CANCELLED: { label: "Cancelada",  color: "var(--error)",            bg: "rgba(248,113,113,0.1)" },
};

const MATCH_STATUS: Record<MatchStatus, { label: string; color: string }> = {
  PLANNED:   { label: "Planejada",  color: "var(--muted-foreground)" },
  LIVE:      { label: "Ao Vivo 🔴",  color: "var(--error)" },
  FINISHED:  { label: "Finalizada", color: "var(--success)" },
  CANCELLED: { label: "Cancelada",  color: "var(--muted-foreground)" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BatalhaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [edicao, setEdicao] = useState<IBatalhaEdicao | null>(null);
  const [partidas, setPartidas] = useState<IBatalhaPartida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      batalhaEdicaoApi.getById(id),
      batalhaPartidaApi.getByEdition(id),
    ])
      .then(([edicaoRes, partidasRes]) => {
        const ed = edicaoRes.data;
        setEdicao(ed?.batalhaEdicao ?? ed?.data ?? ed);

        const pData = partidasRes.data;
        setPartidas(pData?.batalhasPartida ?? pData?.data ?? pData ?? []);
      })
      .catch(() => setError("Não foi possível carregar os detalhes da batalha."))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error || !edicao) {
    return (
      <div className="max-w-2xl">
        <div
          className="rounded-xl px-5 py-4 text-sm border"
          style={{
            background: "rgba(248,113,113,0.08)",
            borderColor: "var(--error)",
            color: "var(--error)",
          }}
        >
          {error ?? "Batalha não encontrada."}
        </div>
        <Link
          href="/dashboard/batalhas"
          className="inline-block mt-4 text-sm font-semibold hover:underline"
          style={{ color: "var(--primary)" }}
        >
          ← Voltar para batalhas
        </Link>
      </div>
    );
  }

  const statusInfo = EDITION_STATUS[edicao.status] ?? EDITION_STATUS.DRAFT;

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/dashboard/batalhas"
        className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Batalhas
      </Link>

      {/* Header */}
      <div
        className="rounded-2xl p-6 border mb-6"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: statusInfo.bg, color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
              {edicao.season && (
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Temporada {edicao.season}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {edicao.name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
              Início
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {formatDate(edicao.startsAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
              Término
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {formatDate(edicao.endsAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
              Partidas
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {partidas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Partidas */}
      <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>
        Partidas
      </h2>

      {partidas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma partida cadastrada para esta edição.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {partidas.map((partida) => {
            const ms = MATCH_STATUS[partida.status] ?? MATCH_STATUS.PLANNED;
            return (
              <div
                key={partida.id}
                className="rounded-2xl p-5 border flex items-center justify-between gap-4"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                    {partida.name ?? `Partida ${partida.id.slice(0, 6)}`}
                  </p>
                  {partida.scheduledAt && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(partida.scheduledAt).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
                <span
                  className="text-xs font-semibold shrink-0"
                  style={{ color: ms.color }}
                >
                  {ms.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
