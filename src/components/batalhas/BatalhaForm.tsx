"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { batalhaBaseApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { IBatalhaBase, BatalhaBaseStatus, ChaveamentoType } from "@/types/batalha";
import {
  loadGoogleMapsPlaces,
  mapGooglePlaceToBattlePlace,
  SelectedBattlePlace,
} from "@/lib/googleMaps";

const batalhaSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo (máx. 100 caracteres)"),
  description: z
    .string()
    .max(500, "Descrição muito longa (máx. 500 caracteres)")
    .optional(),
  status: z.enum(["PLANNED", "RUNNING", "FINISHED"] as const),
  chaveamentoType: z.enum(["SINGLE", "DOUBLE", "TRIPLE"] as const).optional(),
  maxMcs: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ message: "Deve ser um número" })
      .min(2, "Mínimo de 2 MCs")
      .max(256, "Máximo de 256 MCs")
      .optional()
  ),
  numJudges: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ message: "Deve ser um número" })
      .min(1, "Mínimo de 1 jurado")
      .max(20, "Máximo de 20 jurados")
      .optional()
  ),
  roundsPerMc: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ message: "Deve ser um número" })
      .min(1, "Mínimo de 1 rodada")
      .max(10, "Máximo de 10 rodadas")
      .optional()
  ),
});

type BatalhaFormValues = {
  name: string;
  description?: string;
  status: BatalhaBaseStatus;
  chaveamentoType?: ChaveamentoType;
  maxMcs?: number;
  numJudges?: number;
  roundsPerMc?: number;
};

const STATUS_OPTIONS: { value: BatalhaBaseStatus; label: string }[] = [
  { value: "PLANNED", label: "Planejada" },
  { value: "RUNNING", label: "Em Andamento" },
  { value: "FINISHED", label: "Finalizada" },
];

const CHAVEAMENTO_OPTIONS: { value: ChaveamentoType; label: string }[] = [
  { value: "SINGLE", label: "Simples" },
  { value: "DOUBLE", label: "Duplo" },
  { value: "TRIPLE", label: "Triplo" },
];

interface BatalhaFormProps {
  initialData?: IBatalhaBase;
  onSuccess?: (batalha: IBatalhaBase) => void;
}

const inputStyle = {
  background: "var(--input-bg)",
  borderColor: "var(--input-border)",
  color: "var(--foreground)",
};

const inputErrorStyle = {
  background: "var(--input-bg)",
  borderColor: "var(--error)",
  color: "var(--foreground)",
};

export default function BatalhaForm({ initialData, onSuccess }: BatalhaFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [locationLabel, setLocationLabel] = useState(
    initialData?.address ?? ""
  );
  const [selectedPlace, setSelectedPlace] = useState<SelectedBattlePlace | null>(
    initialData
      ? {
          placeId: initialData.placeId,
          placeName: initialData.placeName,
          address: initialData.address,
          city: initialData.city ?? undefined,
          state: initialData.state ?? undefined,
          country: initialData.country ?? undefined,
          latitude: initialData.latitude ?? undefined,
          longitude: initialData.longitude ?? undefined,
        }
      : null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BatalhaFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(batalhaSchema) as unknown as Resolver<BatalhaFormValues>,
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      status: (initialData?.status ?? "PLANNED") as BatalhaBaseStatus,
      chaveamentoType: initialData?.chaveamentoType ?? undefined,
      maxMcs: initialData?.maxMcs ?? undefined,
      numJudges: initialData?.numJudges ?? undefined,
      roundsPerMc: initialData?.roundsPerMc ?? undefined,
    },
  });

  useEffect(() => {
    if (!locationInputRef.current || autocompleteRef.current) return;
    let mounted = true;

    loadGoogleMapsPlaces()
      .then(() => {
        if (!mounted || !locationInputRef.current || autocompleteRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            fields: [
              "place_id",
              "name",
              "formatted_address",
              "address_components",
              "geometry",
            ],
          }
        );

        autocomplete.addListener("place_changed", () => {
          const placeResult = autocomplete.getPlace();
          const mapped = mapGooglePlaceToBattlePlace(placeResult);
          if (!mapped) {
            setSelectedPlace(null);
            setLocationError("Selecione uma opção válida da lista do Google.");
            return;
          }
          setSelectedPlace(mapped);
          setLocationLabel(mapped.address);
          setLocationError(null);
        });

        autocompleteRef.current = autocomplete;
        setMapsError(null);
      })
      .catch(() => {
        setMapsError(
          "Não foi possível carregar o Google Maps. Verifique a chave de API."
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (values: BatalhaFormValues) => {
    if (!selectedPlace) {
      setLocationError("Selecione a localização no autocomplete do Google.");
      return;
    }

    setSubmitError(null);

    try {
      let res;

      if (initialData) {
        res = await batalhaBaseApi.update(initialData.id, {
          name: values.name,
          description: values.description || undefined,
          status: values.status,
          chaveamentoType: values.chaveamentoType,
          maxMcs: values.maxMcs ?? undefined,
          numJudges: values.numJudges ?? undefined,
          roundsPerMc: values.roundsPerMc ?? undefined,
        });
      } else {
        if (!user?.id) {
          setSubmitError("Usuário não autenticado.");
          return;
        }
        res = await batalhaBaseApi.create({
          name: values.name,
          description: values.description || undefined,
          organizerId: user.id,
          placeId: selectedPlace.placeId,
          placeName: selectedPlace.placeName,
          address: selectedPlace.address,
          city: selectedPlace.city,
          state: selectedPlace.state,
          country: selectedPlace.country,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
          status: values.status,
          chaveamentoType: values.chaveamentoType,
          maxMcs: values.maxMcs ?? undefined,
          numJudges: values.numJudges ?? undefined,
          roundsPerMc: values.roundsPerMc ?? undefined,
        });
      }

      const saved: IBatalhaBase =
        res.data?.batalhaBase ?? res.data?.data?.batalhaBase ?? res.data;

      if (onSuccess) {
        onSuccess(saved);
      } else {
        router.push(`/dashboard/batalhas/${saved.id}`);
      }
    } catch {
      setSubmitError(
        initialData
          ? "Erro ao salvar batalha. Tente novamente."
          : "Erro ao criar batalha. Tente novamente."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Nome */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--foreground)" }}
        >
          Nome da Batalha <span style={{ color: "var(--error)" }}>*</span>
        </label>
        <input
          type="text"
          {...register("name")}
          placeholder="Ex: BDR Blumenau"
          className="w-full px-3 py-2 rounded-xl border text-sm"
          style={errors.name ? inputErrorStyle : inputStyle}
        />
        {errors.name && (
          <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--foreground)" }}
        >
          Descrição
        </label>
        <textarea
          {...register("description")}
          placeholder="Descreva a batalha (opcional)"
          rows={3}
          className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
          style={errors.description ? inputErrorStyle : inputStyle}
        />
        {errors.description && (
          <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Localização */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--foreground)" }}
        >
          Localização <span style={{ color: "var(--error)" }}>*</span>
        </label>
        <input
          ref={locationInputRef}
          type="text"
          value={locationLabel}
          onChange={(e) => {
            setLocationLabel(e.target.value);
            setSelectedPlace(null);
            setLocationError(null);
          }}
          placeholder="Digite e selecione um local (Google Maps)"
          className="w-full px-3 py-2 rounded-xl border text-sm"
          style={locationError ? inputErrorStyle : inputStyle}
        />
        {mapsError && (
          <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
            {mapsError}
          </p>
        )}
        {locationError && (
          <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
            {locationError}
          </p>
        )}
        {!mapsError && !locationError && (
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Escolha uma opção da lista para vincular o local.
          </p>
        )}
      </div>

      {/* Status + Chaveamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Status Inicial
          </label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 rounded-xl border text-sm"
            style={inputStyle}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Tipo de Chaveamento
          </label>
          <select
            {...register("chaveamentoType")}
            className="w-full px-3 py-2 rounded-xl border text-sm"
            style={inputStyle}
          >
            <option value="">Selecione...</option>
            {CHAVEAMENTO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Número máximo de MCs / Jurados / Rodadas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Máx. de MCs
          </label>
          <input
            type="number"
            min={2}
            max={256}
            {...register("maxMcs")}
            placeholder="Ex: 16"
            className="w-full px-3 py-2 rounded-xl border text-sm"
            style={errors.maxMcs ? inputErrorStyle : inputStyle}
          />
          {errors.maxMcs && (
            <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
              {errors.maxMcs.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Nº de Jurados
          </label>
          <input
            type="number"
            min={1}
            max={20}
            {...register("numJudges")}
            placeholder="Ex: 3"
            className="w-full px-3 py-2 rounded-xl border text-sm"
            style={errors.numJudges ? inputErrorStyle : inputStyle}
          />
          {errors.numJudges && (
            <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
              {errors.numJudges.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Rodadas por MC
          </label>
          <input
            type="number"
            min={1}
            max={10}
            {...register("roundsPerMc")}
            placeholder="Ex: 2"
            className="w-full px-3 py-2 rounded-xl border text-sm"
            style={errors.roundsPerMc ? inputErrorStyle : inputStyle}
          />
          {errors.roundsPerMc && (
            <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
              {errors.roundsPerMc.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div
          className="rounded-xl px-4 py-3 text-sm border"
          style={{
            background: "rgba(248,113,113,0.08)",
            borderColor: "var(--error)",
            color: "var(--error)",
          }}
        >
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
          style={{
            borderColor: "var(--card-border)",
            color: "var(--muted-foreground)",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          {isSubmitting
            ? initialData
              ? "Salvando..."
              : "Criando..."
            : initialData
            ? "Salvar Alterações"
            : "Criar Batalha"}
        </button>
      </div>
    </form>
  );
}
