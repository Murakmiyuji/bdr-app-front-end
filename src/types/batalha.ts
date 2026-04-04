// ── Batalha Base ──────────────────────────────────────────────────────────────

export type BatalhaBaseStatus = "PLANNED" | "RUNNING" | "FINISHED";
export type ChaveamentoType = "SINGLE" | "DOUBLE" | "TRIPLE";

export interface IBatalhaBase {
  id: string;
  name: string;
  placeId: string;
  placeName: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  organizerId: string;
  status?: BatalhaBaseStatus;
  chaveamentoType?: ChaveamentoType | null;
  maxMcs?: number | null;
  numJudges?: number | null;
  roundsPerMc?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBatalhaBaseCreateParams {
  name: string;
  placeId: string;
  placeName: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  organizerId: string;
  status?: BatalhaBaseStatus;
  chaveamentoType?: ChaveamentoType;
  maxMcs?: number;
  numJudges?: number;
  roundsPerMc?: number;
}

// ── Batalha Edição ────────────────────────────────────────────────────────────

export type EditionStatus = "DRAFT" | "OPEN" | "RUNNING" | "FINISHED" | "CANCELLED";

export interface IBatalhaEdicao {
  id: string;
  battleBaseId: string;
  name: string;
  season: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: EditionStatus;
  createdAt: string;
  updatedAt: string;
  batalhaBase?: { name: string };
}

export interface IBatalhaEdicaoCreateParams {
  battleBaseId: string;
  name: string;
  season?: string;
  startsAt?: string;
  endsAt?: string;
  status?: EditionStatus;
}

// ── Batalha Partida ───────────────────────────────────────────────────────────

export type MatchStatus = "PLANNED" | "LIVE" | "FINISHED" | "CANCELLED";

export interface IBatalhaPartida {
  id: string;
  battleEditionId: string;
  name: string | null;
  scheduledAt: string | null;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Inscrição ─────────────────────────────────────────────────────────────────

export type RegistrationStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "WITHDRAWN";

export interface IInscricao {
  id: string;
  userId: string;
  battleEditionId: string;
  status: RegistrationStatus;
  seed: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IInscricaoCreateParams {
  userId: string;
  battleEditionId: string;
}

// ── Respostas genéricas ───────────────────────────────────────────────────────

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total?: number;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}
