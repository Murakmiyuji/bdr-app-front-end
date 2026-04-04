"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { batalhaBaseApi } from "@/lib/api";
import { IBatalhaBase } from "@/types/batalha";
import BatalhaForm from "@/components/batalhas/BatalhaForm";

export default function CriarBatalhaPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [initialData, setInitialData] = useState<IBatalhaBase | undefined>(
    undefined
  );
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editId);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;

    batalhaBaseApi
      .getById(editId)
      .then((res) => {
        const bat = res.data;
        setInitialData(bat?.batalhaBase ?? bat?.data ?? bat);
      })
      .catch(() => setLoadError("Não foi possível carregar os dados da batalha."))
      .finally(() => setIsLoadingEdit(false));
  }, [editId]);

  const isEditMode = !!editId;
  const pageTitle = isEditMode ? "Editar Batalha" : "Nova Batalha";
  const pageSubtitle = isEditMode
    ? "Atualize as informações da batalha"
    : "Preencha os detalhes para criar uma nova batalha";

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link
        href="/dashboard/batalhas"
        className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Batalhas
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--foreground)" }}
        >
          {pageTitle}
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {pageSubtitle}
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: "var(--card)",
          borderColor: "var(--card-border)",
        }}
      >
        {isLoadingEdit ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{
                borderColor: "var(--primary)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : loadError ? (
          <div
            className="rounded-xl px-5 py-4 text-sm border"
            style={{
              background: "rgba(248,113,113,0.08)",
              borderColor: "var(--error)",
              color: "var(--error)",
            }}
          >
            {loadError}
          </div>
        ) : (
          <BatalhaForm initialData={initialData} />
        )}
      </div>
    </div>
  );
}
