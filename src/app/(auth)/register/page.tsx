"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { RegisterLocationFields } from "@/components/register/RegisterLocationFields";

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
    country: z.string().min(1, "Selecione um país"),
    state: z.string().min(1, "Informe o estado"),
    city: z.string().min(1, "Informe a cidade"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const s = data.stageName?.trim();
      return !s || s.length >= 2;
    },
    {
      message: "Nome artístico deve ter pelo menos 2 caracteres",
      path: ["stageName"],
    }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

const STEPS = [
  { title: "Sua conta", subtitle: "E-mail e senha para acessar o app" },
  { title: "Quem é você", subtitle: "Nome e como você aparece nas batalhas" },
  { title: "Sua região", subtitle: "Conecte-se a eventos perto de você" },
] as const;

const STEP_FIELDS: (keyof RegisterFormData)[][] = [
  ["email", "password", "confirmPassword"],
  ["name", "stageName"],
  ["country", "state", "city"],
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      stageName: "",
      country: "",
      state: "",
      city: "",
    },
    mode: "onTouched",
  });

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const ok = await trigger(fields);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setServerError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...rest } = data;
      void confirmPassword;
      const result = await registerUser({
        name: rest.name,
        email: rest.email,
        password: rest.password,
        stageName: rest.stageName?.trim() || undefined,
        country: rest.country,
        state: rest.state,
        city: rest.city,
      });
      setSuccessMessage(result.message);
      reset();
      setStep(0);
      setCountryCode(null);
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <>
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: "var(--foreground)" }}
      >
        Criar conta
      </h1>
      <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
        Junte-se à batalha de rimas
      </p>

      {/* Indicador de etapas */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{
                background:
                  i <= step ? "var(--primary)" : "var(--muted)",
                opacity: i <= step ? 1 : 0.35,
              }}
            />
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--primary)" }}>
          Etapa {step + 1} de {STEPS.length}
        </p>
        <h2 className="text-lg font-semibold mt-1" style={{ color: "var(--foreground)" }}>
          {STEPS[step].title}
        </h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {STEPS[step].subtitle}
        </p>
      </div>

      {successMessage && (
        <div
          className="rounded-lg px-4 py-3 text-sm mb-4"
          style={{
            background: "rgba(74,222,128,0.1)",
            border: "1px solid var(--success)",
            color: "var(--success)",
          }}
        >
          {successMessage}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step !== STEPS.length - 1) return;
          void handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Etapa 0 — Conta */}
        {step === 0 && (
          <>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                E-mail <span style={{ color: "var(--primary)" }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register("email")}
                className="rounded-lg px-4 py-2.5 text-sm outline-none w-full"
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

            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Senha <span style={{ color: "var(--primary)" }}>*</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...register("password")}
                className="rounded-lg px-4 py-2.5 text-sm outline-none w-full"
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

            <div className="flex flex-col gap-1">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Confirmar senha <span style={{ color: "var(--primary)" }}>*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repita a senha"
                {...register("confirmPassword")}
                className="rounded-lg px-4 py-2.5 text-sm outline-none w-full"
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
          </>
        )}

        {/* Etapa 1 — Perfil */}
        {step === 1 && (
          <>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="name"
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Nome completo <span style={{ color: "var(--primary)" }}>*</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                {...register("name")}
                className="rounded-lg px-4 py-2.5 text-sm outline-none w-full"
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

            <div className="flex flex-col gap-1">
              <label
                htmlFor="stageName"
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Nome artístico <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>(opcional)</span>
              </label>
              <input
                id="stageName"
                type="text"
                placeholder="Como você assina no microfone"
                {...register("stageName")}
                className="rounded-lg px-4 py-2.5 text-sm outline-none w-full"
                style={{
                  background: "var(--input-bg)",
                  border: `1px solid ${errors.stageName ? "var(--error)" : "var(--input-border)"}`,
                  color: "var(--foreground)",
                }}
              />
              {errors.stageName && (
                <span className="text-xs" style={{ color: "var(--error)" }}>
                  {errors.stageName.message}
                </span>
              )}
            </div>
          </>
        )}

        {/* Etapa 2 — Localização */}
        {step === 2 && (
          <RegisterLocationFields<RegisterFormData>
            control={control}
            errors={errors}
            setValue={setValue}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
          />
        )}

        {serverError && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid var(--error)",
              color: "var(--error)",
            }}
          >
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-2">
          {!isLastStep && (
            <button
              type="button"
              onClick={() => void goNext()}
              className="rounded-lg py-3 font-semibold text-sm transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Continuar
            </button>
          )}
          {isLastStep && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: isSubmitting ? "var(--muted)" : "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {isSubmitting ? "Cadastrando..." : "Criar conta"}
            </button>
          )}
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="rounded-lg py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
              style={{
                color: "var(--muted-foreground)",
                border: "1px solid var(--card-border)",
                background: "transparent",
              }}
            >
              Voltar
            </button>
          )}
        </div>
      </form>

      <p
        className="mt-6 text-center text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline"
          style={{ color: "var(--primary)" }}
        >
          Entrar
        </Link>
      </p>
    </>
  );
}
