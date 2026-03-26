"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { batalhaBaseApi } from "@/lib/api";
import { IBatalhaBase } from "@/types/batalha";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BatalhasPage() {
  const router = useRouter();
  const [batalhas, setBatalhas] = useState<IBatalhaBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    batalhaBaseApi
      .getAll()
      .then((res) => {
        const data = res.data;
        const list: IBatalhaBase[] = data?.batalhasBase ?? data?.data ?? data ?? [];
        setBatalhas(list);
      })
      .catch(() => setError("Não foi possível carregar as batalhas."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !user) return;

    setIsCreating(true);
    try {
      const res = await batalhaBaseApi.create({
        name: createForm.name,
        description: createForm.description || undefined,
        organizerId: user.id,
      });
      const newBatalha = res.data;
      setBatalhas(prev => [...prev, newBatalha]);
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", description: "" });
      router.push(`/dashboard/batalhas/${newBatalha.id}`);
    } catch (err) {
      setError("Erro ao criar batalha.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Batalhas
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Todas as batalhas da BDR
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl font-medium text-sm transition-colors"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          Criar Nova Batalha
        </button>
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

      {!isLoading && !error && batalhas.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma batalha encontrada.
          </p>
        </div>
      )}

      {!isLoading && batalhas.length > 0 && (
        <div className="flex flex-col gap-3">
          {batalhas.map((batalha) => (
            <Link
              key={batalha.id}
              href={`/dashboard/batalhas/${batalha.id}`}
              className="rounded-2xl p-5 border flex items-center justify-between gap-4 transition-colors hover:border-[var(--primary)]"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>
                  {batalha.name}
                </p>
                {batalha.description && (
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {batalha.description}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Criada em {formatDate(batalha.createdAt)}
                </p>
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
          ))}
        </div>
      )}

      {/* Modal Criar Batalha */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="w-full max-w-md p-6 rounded-2xl border"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>
              Criar Nova Batalha
            </h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Nome da Batalha
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  style={{
                    background: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--foreground)"
                  }}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Descrição (opcional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
                  style={{
                    background: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--foreground)"
                  }}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--card-border)", color: "var(--muted-foreground)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  {isCreating ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
