export type UserRole = "MC" | "ORGANIZER" | "JUDGE" | "AUDIENCE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  roles: UserRole[];
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

// Payload retornado pelo login
export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  name: string;
  email: string;
  roles?: UserRole[];
}

// Parâmetros de login
export interface LoginParams {
  email: string;
  password: string;
}

// Parâmetros de cadastro
export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  stageName?: string;
  city?: string;
}

// Resposta do cadastro
export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  stageName?: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

// Resposta genérica de sucesso da API
export interface ApiSuccessResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Resposta de erro da API
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
}
