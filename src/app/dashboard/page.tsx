"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const ROLE_LABEL: Record<string, string> = {
  MC: "MC",
  ORGANIZER: "Organizador",
  JUDGE: "Jurado",
  AUDIENCE: "Público",
};

export default function DashboardPage() {
  const { user } = useAuth();

  const roleLabel =
    user?.roles?.map((r) => ROLE_LABEL[r] ?? r).join(", ") ?? "Público";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
          Bem-vindo, {user?.name?.split(" ")[0] ?? "usuário"}! 👋
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Perfil: <span style={{ color: "var(--primary)" }}>{roleLabel}</span>
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/batalhas"
          className="rounded-2xl p-6 border flex items-start gap-4 transition-colors hover:border-[var(--primary)]"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(230,57,70,0.12)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
              Batalhas
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Veja as edições em andamento e próximas batalhas
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/inscricoes"
          className="rounded-2xl p-6 border flex items-start gap-4 transition-colors hover:border-[var(--primary)]"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(74,222,128,0.1)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
              Inscrições
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Gerencie suas inscrições nas batalhas
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/perfil"
          className="rounded-2xl p-6 border flex items-start gap-4 transition-colors hover:border-[var(--primary)]"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(230,57,70,0.08)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
              Meu Perfil
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Visualize e edite seus dados
            </p>
          </div>
        </Link>
      </div>

      {/* Info card */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>
          Sobre o BDR APP
        </h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Plataforma oficial da <strong style={{ color: "var(--primary)" }}>Batalha de Rima em Blumenau</strong>.
          Acompanhe edições, partidas, rounds e resultados em tempo real.
          MCs podem se inscrever nas batalhas abertas e gerenciar suas participações.
        </p>
      </div>
    </div>
  );
}
