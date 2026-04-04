"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { batalhaBaseApi, batalhaEdicaoApi } from "@/lib/api";
import { IBatalhaBase, IBatalhaEdicao, EditionStatus } from "@/types/batalha";
import StatusBadge from "@/components/batalhas/StatusBadge";

const EDITION_STATUS: Record<EditionStatus, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: "Rascunho",   color: "var(--muted-foreground)", bg: "rgba(160,160,160,0.1)" },
  OPEN:      { label: "Aberta",     color: "var(--success)",          bg: "rgba(74,222,128,0.1)" },
  RUNNING:   { label: "Em Curso",   color: "#facc15",                 bg: "rgba(250,204,21,0.1)" },
  FINISHED:  { label: "Finalizada", color: "var(--muted-foreground)", bg: "rgba(160,160,160,0.1)" },
  CANCELLED: { label: "Cancelada",  color: "var(--error)",            bg: "rgba(248,113,113,0.1)" },
};

const CHAVEAMENTO_LABEL: Record<string, string> = {
  SINGLE: "Simples",
  DOUBLE: "Duplo",
  TRIPLE: "Triplo",
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
  const router = useRouter();
  const [batalha, setBatalha] = useState<IBatalhaBase | null>(null);
  const [edicoes, setEdicoes] = useState<IBatalhaEdicao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      batalhaBaseApi.getById(id),
      batalhaEdicaoApi.getByBase(id),
    ])
      .then(([batalhaRes, edicoesRes]) => {
        const bat = batalhaRes.data;
        setBatalha(bat?.batalhaBase ?? bat?.data ?? bat);

        const eds = edicoesRes.data;
        const list: IBatalhaEdicao[] = eds?.batalhasEdicao ?? eds?.data ?? eds ?? [];
        setEdicoes(list);
      })
      .catch(() => setError("Não foi possível carregar a batalha."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!batalha) return;
    if (!confirm(`Deseja realmente deletar a batalha "${batalha.name}"? Esta ação não pode ser desfeita.`)) return;

    setIsDeleting(true);
    try {
      await batalhaBaseApi.delete(batalha.id);
      router.push("/dashboard/batalhas");
    } catch {
      setError("Erro ao deletar a batalha. Tente novamente.");
      setIsDeleting(false);
    }
  };

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

  if (error || !batalha) {
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {batalha.name}
              </h1>
              {batalha.status && <StatusBadge status={batalha.status} size="md" />}
            </div>

            {batalha.description && (
              <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
                {batalha.description}
              </p>
            )}

            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              📍 {batalha.city && batalha.state
                ? `${batalha.city} — ${batalha.state}`
                : batalha.address}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Criada em {formatDate(batalha.createdAt)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/dashboard/batalhas/criar?id=${batalha.id}`}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: "rgba(160,160,160,0.1)",
                color: "var(--muted-foreground)",
              }}
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                background: "rgba(248,113,113,0.1)",
                color: "var(--error)",
              }}
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </button>
          </div>
        </div>

        {/* Configuration grid */}
        {(batalha.chaveamentoType || batalha.maxMcs != null || batalha.numJudges != null || batalha.roundsPerMc != null) && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t"
            style={{ borderColor: "var(--card-border)" }}
          >
            {batalha.chaveamentoType && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Chaveamento
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {CHAVEAMENTO_LABEL[batalha.chaveamentoType]}
                </p>
              </div>
            )}
            {batalha.maxMcs != null && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Máx. MCs
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {batalha.maxMcs}
                </p>
              </div>
            )}
            {batalha.numJudges != null && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Jurados
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {batalha.numJudges}
                </p>
              </div>
            )}
            {batalha.roundsPerMc != null && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Rodadas/MC
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {batalha.roundsPerMc}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edições */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Edições
        </h2>
      </div>

      {edicoes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma edição cadastrada para esta batalha.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {edicoes.map((edicao) => {
            const status = EDITION_STATUS[edicao.status] ?? EDITION_STATUS.DRAFT;
            return (
              <Link
                key={edicao.id}
                href={`/dashboard/batalhas/edicao/${edicao.id}`}
                className="rounded-2xl p-5 border flex items-center justify-between gap-4 transition-colors hover:border-[var(--primary)]"
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

      {/* Ranking */}
      <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>
        Ranking
      </h2>
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Ranking ainda não implementado.
        </p>
      </div>
    </div>
  );
}
