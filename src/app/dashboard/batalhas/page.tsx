"use client";

import { useState } from "react";
import Link from "next/link";
import { BatalhaBaseStatus } from "@/types/batalha";
import { useBatalhas } from "@/hooks/useBatalhas";
import BatalhaCard from "@/components/batalhas/BatalhaCard";
import FilterBar from "@/components/batalhas/FilterBar";

export default function BatalhasPage() {
  const { isLoading, error, deleteBatalha, filterBatalhas } = useBatalhas();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatalhaBaseStatus | "ALL">(
    "ALL"
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = filterBatalhas(search, statusFilter);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente deletar esta batalha?")) return;
    try {
      await deleteBatalha(id);
    } catch {
      setDeleteError("Erro ao deletar batalha. Tente novamente.");
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Batalhas
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Todas as batalhas da BDR
          </p>
        </div>
        <Link
          href="/dashboard/batalhas/criar"
          className="px-4 py-2 rounded-xl font-medium text-sm transition-colors"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          Nova Batalha
        </Link>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: "var(--primary)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      )}

      {(error || deleteError) && !isLoading && (
        <div
          className="rounded-xl px-5 py-4 text-sm border mb-4"
          style={{
            background: "rgba(248,113,113,0.08)",
            borderColor: "var(--error)",
            color: "var(--error)",
          }}
        >
          {error ?? deleteError}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {search || statusFilter !== "ALL"
              ? "Nenhuma batalha encontrada com esses filtros."
              : "Nenhuma batalha cadastrada ainda."}
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((batalha) => (
            <BatalhaCard
              key={batalha.id}
              batalha={batalha}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

