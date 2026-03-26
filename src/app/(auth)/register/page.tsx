"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/\d/, "Senha precisa conter um número")
      .regex(/[a-z]/, "Senha precisa conter uma letra minúscula")
      .regex(/[A-Z]/, "Senha precisa conter uma letra maiúscula")
      .regex(/[\W]/, "Senha precisa conter um caractere especial"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    stageName: z.string().optional(),
    city: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...params } = data;
      void confirmPassword; // não enviado ao backend
      const result = await registerUser({
        ...params,
        stageName: params.stageName || undefined,
        city: params.city || undefined,
      });
      setSuccessMessage(result.message);
      reset();
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
        Criar conta
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
        Junte-se à batalha de rimas
      </p>

      {/* Sucesso */}
      {successMessage && (
        <div className="rounded-lg px-4 py-3 text-sm mb-4"
          style={{
            background: "rgba(74,222,128,0.1)",
            border: "1px solid var(--success)",
            color: "var(--success)",
          }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Nome */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}>
            Nome completo <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            {...register("name")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--input-bg)",
              border: `1px solid ${errors.name ? "var(--error)" : "var(--input-border)"}`,
              color: "var(--foreground)",
            }}
          />
          {errors.name && (
            <span className="text-xs" style={{ color: "var(--error)" }}>
              {errors.name.message}
            </span>
          )}
        </div>

        {/* E-mail */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}>
            E-mail <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            {...register("email")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none"
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
          <label htmlFor="password" className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}>
            Senha <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none"
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
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Use letras maiúsculas, minúsculas, números e símbolos
          </p>
        </div>

        {/* Confirmar senha */}
        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}>
            Confirmar senha <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            {...register("confirmPassword")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--input-bg)",
              border: `1px solid ${errors.confirmPassword ? "var(--error)" : "var(--input-border)"}`,
              color: "var(--foreground)",
            }}
          />
          {errors.confirmPassword && (
            <span className="text-xs" style={{ color: "var(--error)" }}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Divider com campos opcionais */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Opcional
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
        </div>

        {/* Nome artístico */}
        <div className="flex flex-col gap-1">
          <label htmlFor="stageName" className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}>
            Nome artístico
          </label>
          <input
            id="stageName"
            type="text"
            placeholder="Seu nome no microfone"
            {...register("stageName")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--input-bg)",
              border: `1px solid ${errors.stageName ? "var(--error)" : "var(--input-border)"}`,
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Cidade */}
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}>
            Cidade
          </label>
          <input
            id="city"
            type="text"
            placeholder="Blumenau, SC"
            {...register("city")}
            className="rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--input-bg)",
              border: `1px solid ${errors.city ? "var(--error)" : "var(--input-border)"}`,
              color: "var(--foreground)",
            }}
          />
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
          {isSubmitting ? "Cadastrando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Já tem uma conta?{" "}
        <Link href="/login"
          className="font-semibold hover:underline"
          style={{ color: "var(--primary)" }}>
          Entrar
        </Link>
      </p>
    </>
  );
}
