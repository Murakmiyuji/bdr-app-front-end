"use client";

import { useCallback, useEffect, useState } from "react";
import { batalhaBaseApi } from "@/lib/api";
import { IBatalhaBase, BatalhaBaseStatus } from "@/types/batalha";

export function useBatalhas() {
  const [batalhas, setBatalhas] = useState<IBatalhaBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await batalhaBaseApi.getAll();
      const data = res.data;
      const list: IBatalhaBase[] =
        data?.batalhasBase ?? data?.data ?? data ?? [];
      setBatalhas(list);
    } catch {
      setError("Não foi possível carregar as batalhas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBatalha = useCallback(async (id: string): Promise<void> => {
    await batalhaBaseApi.delete(id);
    setBatalhas((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filterBatalhas = useCallback(
    (search: string, status: BatalhaBaseStatus | "ALL"): IBatalhaBase[] => {
      let filtered = batalhas;

      if (status !== "ALL") {
        filtered = filtered.filter((b) => b.status === status);
      }

      if (search.trim()) {
        const lower = search.trim().toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.name.toLowerCase().includes(lower) ||
            b.address.toLowerCase().includes(lower) ||
            (b.city?.toLowerCase().includes(lower) ?? false)
        );
      }

      return filtered;
    },
    [batalhas]
  );

  return { batalhas, isLoading, error, reload: load, deleteBatalha, filterBatalhas };
}
