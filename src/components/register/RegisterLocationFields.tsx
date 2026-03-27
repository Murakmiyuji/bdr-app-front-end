"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import {
  CountryOption,
  IbgeEstado,
  IbgeMunicipio,
  NominatimResult,
  fetchIbgeEstados,
  fetchIbgeMunicipios,
  pickCityFromNominatim,
  pickStateFromNominatim,
  searchCountries,
  searchNominatim,
} from "@/lib/location";

const INPUT_BASE_CLASS =
  "rounded-lg px-4 py-2.5 text-sm outline-none w-full";

const inputStyle = (hasError: boolean): CSSProperties => ({
  background: "var(--input-bg)",
  border: `1px solid ${hasError ? "var(--error)" : "var(--input-border)"}`,
  color: "var(--foreground)",
});

type FormShape = {
  country: string;
  state: string;
  city: string;
};

type Props<T extends FormShape> = {
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  countryCode: string | null;
  onCountryCodeChange: (code: string | null) => void;
};

function useDebounced<T>(value: T, delay: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function RegisterLocationFields<T extends FormShape>({
  control,
  errors,
  setValue,
  countryCode,
  onCountryCodeChange,
}: Props<T>) {
  const country = useWatch({
    control,
    name: "country" as never,
  }) as unknown as string;
  const stateVal = useWatch({
    control,
    name: "state" as never,
  }) as unknown as string;

  const [countryInput, setCountryInput] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySuggestions, setCountrySuggestions] = useState<CountryOption[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const debouncedCountryQ = useDebounced(countryInput, 400);

  const [ibgeEstados, setIbgeEstados] = useState<IbgeEstado[]>([]);
  const [estadoQuery, setEstadoQuery] = useState("");
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [ibgeMunicipios, setIbgeMunicipios] = useState<IbgeMunicipio[]>([]);
  const [cidadeQuery, setCidadeQuery] = useState("");
  const [cidadeOpen, setCidadeOpen] = useState(false);

  const [stateOsQuery, setStateOsQuery] = useState("");
  const [stateOsOpen, setStateOsOpen] = useState(false);
  const [stateOsResults, setStateOsResults] = useState<NominatimResult[]>([]);
  const debouncedStateOs = useDebounced(stateOsQuery, 450);

  const [cityOsQuery, setCityOsQuery] = useState("");
  const [cityOsOpen, setCityOsOpen] = useState(false);
  const [cityOsResults, setCityOsResults] = useState<NominatimResult[]>([]);
  const debouncedCityOs = useDebounced(cityOsQuery, 450);

  const isBrazil = countryCode === "BR";

  useEffect(() => {
    if (country) setCountryInput(country);
  }, [country]);

  useEffect(() => {
    if (debouncedCountryQ.length < 2) {
      setCountrySuggestions([]);
      setCountryLoading(false);
      return;
    }
    let cancelled = false;
    setCountryLoading(true);
    searchCountries(debouncedCountryQ).then((list) => {
      if (!cancelled) {
        setCountrySuggestions(list);
        setCountryLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedCountryQ]);

  useEffect(() => {
    if (!isBrazil) {
      setIbgeEstados([]);
      setSelectedEstadoId(null);
      setIbgeMunicipios([]);
      return;
    }
    let cancelled = false;
    fetchIbgeEstados().then((list) => {
      if (!cancelled) setIbgeEstados(list);
    });
    return () => {
      cancelled = true;
    };
  }, [isBrazil]);

  useEffect(() => {
    if (!selectedEstadoId || !isBrazil) {
      setIbgeMunicipios([]);
      return;
    }
    let cancelled = false;
    fetchIbgeMunicipios(selectedEstadoId).then((list) => {
      if (!cancelled) setIbgeMunicipios(list);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedEstadoId, isBrazil]);

  useEffect(() => {
    if (!countryCode || countryCode === "BR" || debouncedStateOs.length < 2) {
      setStateOsResults([]);
      return;
    }
    let cancelled = false;
    searchNominatim(debouncedStateOs, countryCode).then((list) => {
      if (!cancelled) setStateOsResults(list);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedStateOs, countryCode]);

  useEffect(() => {
    if (!countryCode || countryCode === "BR" || debouncedCityOs.length < 2) {
      setCityOsResults([]);
      return;
    }
    const q =
      stateVal && debouncedCityOs
        ? `${debouncedCityOs} ${stateVal}`
        : debouncedCityOs;
    let cancelled = false;
    searchNominatim(q, countryCode).then((list) => {
      if (!cancelled) setCityOsResults(list);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedCityOs, countryCode, stateVal]);

  const estadosFiltrados = useMemo(() => {
    const q = estadoQuery.trim().toLowerCase();
    if (!q) return ibgeEstados;
    return ibgeEstados.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) || e.sigla.toLowerCase().includes(q)
    );
  }, [ibgeEstados, estadoQuery]);

  const cidadesFiltradas = useMemo(() => {
    const q = cidadeQuery.trim().toLowerCase();
    if (!q) return ibgeMunicipios;
    return ibgeMunicipios.filter((m) => m.nome.toLowerCase().includes(q));
  }, [ibgeMunicipios, cidadeQuery]);

  const closeSoon = useCallback((fn: () => void) => {
    window.setTimeout(fn, 180);
  }, []);

  const errCountry = errors.country as { message?: string } | undefined;
  const errState = errors.state as { message?: string } | undefined;
  const errCity = errors.city as { message?: string } | undefined;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        País, estado e cidade ajudam a conectar você a batalhas da sua região. O
        Brasil usa dados do IBGE; demais países usam OpenStreetMap (Nominatim).
      </p>

      {/* País */}
      <Controller
        name={"country" as never}
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              País <span style={{ color: "var(--primary)" }}>*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                placeholder="Digite para buscar (ex: Brasil, Argentina)"
                value={countryInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setCountryInput(v);
                  setCountryOpen(true);
                  if (!v) {
                    field.onChange("");
                    onCountryCodeChange(null);
                    setValue("state" as never, "" as never);
                    setValue("city" as never, "" as never);
                    setSelectedEstadoId(null);
                    setEstadoQuery("");
                    setCidadeQuery("");
                    setStateOsQuery("");
                    setCityOsQuery("");
                  }
                }}
                onFocus={() => setCountryOpen(true)}
                onBlur={() =>
                  closeSoon(() => {
                    setCountryOpen(false);
                    field.onBlur();
                  })
                }
                className={INPUT_BASE_CLASS}
                style={inputStyle(!!errCountry)}
              />
              {countryOpen && countryInput.length >= 2 && (
                <ul
                  className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border py-1 text-sm shadow-lg"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  {countryLoading && (
                    <li
                      className="px-3 py-2"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Buscando países…
                    </li>
                  )}
                  {!countryLoading &&
                    countrySuggestions.map((c) => (
                      <li key={c.cca2}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:opacity-90"
                          style={{
                            color: "var(--foreground)",
                            background: "transparent",
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            field.onChange(c.name);
                            setCountryInput(c.name);
                            onCountryCodeChange(c.cca2);
                            setValue("state" as never, "" as never);
                            setValue("city" as never, "" as never);
                            setSelectedEstadoId(null);
                            setEstadoQuery("");
                            setCidadeQuery("");
                            setStateOsQuery("");
                            setCityOsQuery("");
                            setCountryOpen(false);
                          }}
                        >
                          {c.name}
                        </button>
                      </li>
                    ))}
                  {!countryLoading && countrySuggestions.length === 0 && (
                    <li
                      className="px-3 py-2"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Nenhum país encontrado.
                    </li>
                  )}
                </ul>
              )}
            </div>
            {errCountry?.message && (
              <span className="text-xs" style={{ color: "var(--error)" }}>
                {errCountry.message}
              </span>
            )}
          </div>
        )}
      />

      {!countryCode && (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Selecione um país para habilitar estado e cidade.
        </p>
      )}

      {countryCode && isBrazil && (
        <>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Estado (UF) <span style={{ color: "var(--primary)" }}>*</span>
            </label>
            <Controller
              name={"state" as never}
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Busque por nome ou sigla (ex: SC)"
                    value={estadoQuery || field.value}
                    onChange={(e) => {
                      setEstadoQuery(e.target.value);
                      setEstadoOpen(true);
                      field.onChange("");
                      setSelectedEstadoId(null);
                      setValue("city" as never, "" as never);
                      setCidadeQuery("");
                    }}
                    onFocus={() => setEstadoOpen(true)}
                    onBlur={() => closeSoon(() => setEstadoOpen(false))}
                    className={INPUT_BASE_CLASS}
                    style={inputStyle(!!errState)}
                  />
                  {estadoOpen && estadosFiltrados.length > 0 && (
                    <ul
                      className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border py-1 text-sm shadow-lg"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      {estadosFiltrados.slice(0, 80).map((e) => (
                        <li key={e.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left"
                            style={{
                              color: "var(--foreground)",
                              background: "transparent",
                            }}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => {
                              field.onChange(e.nome);
                              setEstadoQuery(e.nome);
                              setSelectedEstadoId(e.id);
                              setValue("city" as never, "" as never);
                              setCidadeQuery("");
                              setEstadoOpen(false);
                            }}
                          >
                            {e.nome} ({e.sigla})
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />
            {errState?.message && (
              <span className="text-xs" style={{ color: "var(--error)" }}>
                {errState.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Cidade <span style={{ color: "var(--primary)" }}>*</span>
            </label>
            <Controller
              name={"city" as never}
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="off"
                    disabled={!selectedEstadoId}
                    placeholder={
                      selectedEstadoId
                        ? "Busque sua cidade"
                        : "Selecione um estado primeiro"
                    }
                    value={cidadeQuery || field.value}
                    onChange={(e) => {
                      setCidadeQuery(e.target.value);
                      setCidadeOpen(true);
                      field.onChange("");
                    }}
                    onFocus={() => selectedEstadoId && setCidadeOpen(true)}
                    onBlur={() => closeSoon(() => setCidadeOpen(false))}
                    className={INPUT_BASE_CLASS}
                    style={{
                      ...inputStyle(!!errCity),
                      opacity: selectedEstadoId ? 1 : 0.6,
                    }}
                  />
                  {cidadeOpen && selectedEstadoId && cidadesFiltradas.length > 0 && (
                    <ul
                      className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border py-1 text-sm shadow-lg"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      {cidadesFiltradas.slice(0, 100).map((m) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left"
                            style={{
                              color: "var(--foreground)",
                              background: "transparent",
                            }}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => {
                              field.onChange(m.nome);
                              setCidadeQuery(m.nome);
                              setCidadeOpen(false);
                            }}
                          >
                            {m.nome}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />
            {errCity?.message && (
              <span className="text-xs" style={{ color: "var(--error)" }}>
                {errCity.message}
              </span>
            )}
          </div>
        </>
      )}

      {countryCode && !isBrazil && (
        <>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Estado / região <span style={{ color: "var(--primary)" }}>*</span>
            </label>
            <Controller
              name={"state" as never}
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Digite para buscar (OpenStreetMap)"
                    value={stateOsQuery || field.value}
                    onChange={(e) => {
                      setStateOsQuery(e.target.value);
                      setStateOsOpen(true);
                      field.onChange("");
                      setValue("city" as never, "" as never);
                      setCityOsQuery("");
                    }}
                    onFocus={() => setStateOsOpen(true)}
                    onBlur={() => closeSoon(() => setStateOsOpen(false))}
                    className={INPUT_BASE_CLASS}
                    style={inputStyle(!!errState)}
                  />
                  {stateOsOpen && stateOsResults.length > 0 && (
                    <ul
                      className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border py-1 text-sm shadow-lg"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      {stateOsResults.map((r, idx) => {
                        const label = pickStateFromNominatim(r) || r.display_name;
                        return (
                          <li key={`${r.display_name}-${idx}`}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-xs"
                              style={{
                                color: "var(--foreground)",
                                background: "transparent",
                              }}
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={() => {
                                const st = pickStateFromNominatim(r);
                                field.onChange(st || r.display_name.split(",")[0]);
                                setStateOsQuery(st || r.display_name.split(",")[0]);
                                setValue("city" as never, "" as never);
                                setCityOsQuery("");
                                setStateOsOpen(false);
                              }}
                            >
                              {r.display_name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            />
            {errState?.message && (
              <span className="text-xs" style={{ color: "var(--error)" }}>
                {errState.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Cidade <span style={{ color: "var(--primary)" }}>*</span>
            </label>
            <Controller
              name={"city" as never}
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Busque sua cidade"
                    value={cityOsQuery || field.value}
                    onChange={(e) => {
                      setCityOsQuery(e.target.value);
                      setCityOsOpen(true);
                      field.onChange("");
                    }}
                    onFocus={() => setCityOsOpen(true)}
                    onBlur={() => closeSoon(() => setCityOsOpen(false))}
                    className={INPUT_BASE_CLASS}
                    style={inputStyle(!!errCity)}
                  />
                  {cityOsOpen && cityOsResults.length > 0 && (
                    <ul
                      className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border py-1 text-sm shadow-lg"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      {cityOsResults.map((r, idx) => {
                        const city = pickCityFromNominatim(r);
                        return (
                          <li key={`c-${r.display_name}-${idx}`}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-xs"
                              style={{
                                color: "var(--foreground)",
                                background: "transparent",
                              }}
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={() => {
                                field.onChange(city);
                                setCityOsQuery(city);
                                const st = pickStateFromNominatim(r);
                                if (st) {
                                  setValue("state" as never, st as never);
                                  setStateOsQuery(st);
                                }
                                setCityOsOpen(false);
                              }}
                            >
                              {r.display_name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            />
            {errCity?.message && (
              <span className="text-xs" style={{ color: "var(--error)" }}>
                {errCity.message}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
