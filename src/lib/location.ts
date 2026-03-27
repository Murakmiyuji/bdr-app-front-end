export type CountryOption = {
  cca2: string;
  name: string;
};

export type IbgeEstado = {
  id: number;
  sigla: string;
  nome: string;
};

export type IbgeMunicipio = {
  id: number;
  nome: string;
};

export type NominatimResult = {
  display_name: string;
  address?: {
    state?: string;
    region?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
  };
};

/** REST Countries — lista países pelo nome (pt-BR quando disponível). */
export async function searchCountries(query: string): Promise<CountryOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,cca2,translations`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .map((c: { cca2: string; name: { common: string }; translations?: { por?: { common: string } } }) => ({
        cca2: c.cca2,
        name: c.translations?.por?.common ?? c.name.common,
      }))
      .sort((a: CountryOption, b: CountryOption) =>
        a.name.localeCompare(b.name, "pt-BR")
      );
  } catch {
    return [];
  }
}

export async function fetchIbgeEstados(): Promise<IbgeEstado[]> {
  const res = await fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchIbgeMunicipios(estadoId: number): Promise<IbgeMunicipio[]> {
  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`
  );
  if (!res.ok) return [];
  return res.json();
}

/** Busca genérica via rota Next (Nominatim + User-Agent). */
export async function searchNominatim(
  q: string,
  countryCode: string
): Promise<NominatimResult[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  const params = new URLSearchParams({
    q: trimmed,
    countrycodes: countryCode.toLowerCase(),
  });
  try {
    const res = await fetch(`/api/location/nominatim?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function pickCityFromNominatim(r: NominatimResult): string {
  const a = r.address;
  if (!a) return r.display_name.split(",")[0]?.trim() ?? "";
  return (
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.county ||
    r.display_name.split(",")[0]?.trim() ||
    ""
  );
}

export function pickStateFromNominatim(r: NominatimResult): string {
  const a = r.address;
  if (!a) return "";
  return a.state || a.region || "";
}
