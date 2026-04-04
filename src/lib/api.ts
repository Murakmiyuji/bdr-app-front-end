import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAuth,
} from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Injeta o token de acesso em todas as requisições
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tenta renovar o token quando recebe 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        saveTokens({ token: newToken, refreshToken: newRefreshToken });
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --- Funções de autenticação ---

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/users/login", { email, password }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    stageName?: string;
    city?: string;
    state?: string;
    country?: string;
  }) => api.post("/users/register", data),

  logout: () => api.post("/users/logout"),

  me: () => api.get("/auth/me"),

  forgotPassword: (email: string) =>
    api.post("/users/forgotPassword", { email }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    api.post("/users/resetPassword", { token, password, confirmPassword }),

  confirmAccount: (token: string) =>
    api.post("/users/confirm", { token }),
};

// --- Batalhas Base ---

export const batalhaBaseApi = {
  getAll: () => api.get("/batalhas-base"),
  getById: (id: string) => api.get(`/batalhas-base/${id}`),
  create: (data: {
    name: string;
    description?: string;
    organizerId: string;
    placeId: string;
    placeName: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    status?: string;
    chaveamentoType?: string;
    maxMcs?: number;
    numJudges?: number;
    roundsPerMc?: number;
  }) =>
    api.post("/batalhas-base", data),
  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      chaveamentoType?: string;
      maxMcs?: number;
      numJudges?: number;
      roundsPerMc?: number;
    }
  ) => api.put(`/batalhas-base/${id}`, data),
  delete: (id: string) => api.delete(`/batalhas-base/${id}`),
};

// --- Batalhas Edição ---

export const batalhaEdicaoApi = {
  getAll: () => api.get("/batalhas-edicao"),
  getById: (id: string) => api.get(`/batalhas-edicao/${id}`),
  getByBase: (battleBaseId: string) =>
    api.get(`/batalhas-edicao/base/${battleBaseId}`),
  create: (data: {
    battleBaseId: string;
    name: string;
    season?: string;
    startsAt?: string;
    endsAt?: string;
    status?: string;
  }) => api.post("/batalhas-edicao", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/batalhas-edicao/${id}`, data),
  delete: (id: string) => api.delete(`/batalhas-edicao/${id}`),
};

// --- Batalhas Partida ---

export const batalhaPartidaApi = {
  getAll: () => api.get("/batalhas-partida"),
  getByEdition: (battleEditionId: string) =>
    api.get(`/batalhas-partida/edicao/${battleEditionId}`),
  getById: (id: string) => api.get(`/batalhas-partida/${id}`),
};

// --- Inscrições ---

export const inscricaoApi = {
  getAll: () => api.get("/inscricoes"),
  getByEdition: (battleEditionId: string) =>
    api.get(`/inscricoes/edicao/${battleEditionId}`),
  getMyRegistrations: () => api.get("/inscricoes/me"),
  create: (data: { userId: string; battleEditionId: string }) =>
    api.post("/inscricoes", data),
  cancel: (id: string) => api.delete(`/inscricoes/${id}`),
};
