"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await login(data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setServerError(
        axiosErr.response?.data?.message ||
          "Credenciais inválidas. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
        Entrar
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
        Acesse sua conta para continuar
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="forms-login flex flex-col gap-4" noValidate>
        {/* E-mail */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            {...register("email")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: "var(--input-bg)",
              border: `1px solid ${errors.email ? "var(--error)" : "var(--input-border)"}`,
              color: "var(--foreground)",
            }}
          />
          {errors.email && (
            <span className="text-xs" style={{ color: "var(--error)" }}>
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}>
              Senha
            </label>
            <Link href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: "var(--primary)" }}>
              Esqueceu a senha?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: "var(--input-bg)",
              border: `1px solid ${errors.password ? "var(--error)" : "var(--input-border)"}`,
              color: "var(--foreground)",
            }}
          />
          {errors.password && (
            <span className="text-xs" style={{ color: "var(--error)" }}>
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Erro do servidor */}
        {serverError && (
          <div className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid var(--error)",
              color: "var(--error)",
            }}>
            {serverError}
          </div>
        )}

        {/* Botão */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: isSubmitting ? "var(--muted)" : "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Não tem uma conta?{" "}
        <Link href="/register"
          className="font-semibold hover:underline"
          style={{ color: "var(--primary)" }}>
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
