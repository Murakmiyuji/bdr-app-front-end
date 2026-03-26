"use client";

import { useAuth } from "@/context/AuthContext";

const ROLE_LABEL: Record<string, string> = {
  MC: "MC",
  ORGANIZER: "Organizador",
  JUDGE: "Jurado",
  AUDIENCE: "Público",
};

export default function PerfilPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
          Meu Perfil
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Suas informações de conta
        </p>
      </div>

      {/* Avatar + nome */}
      <div
        className="rounded-2xl p-6 border mb-4 flex items-center gap-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 font-bold text-2xl"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
            {user?.name ?? "—"}
          </p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {user?.email ?? "—"}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {user?.roles?.map((role) => (
              <span
                key={role}
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(230,57,70,0.12)", color: "var(--primary)" }}
              >
                {ROLE_LABEL[role] ?? role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        className="rounded-2xl border divide-y"
        style={{ background: "var(--card)", borderColor: "var(--card-border)", divideColor: "var(--card-border)" }}
      >
        <div className="px-6 py-4">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Nome
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {user?.name ?? "—"}
          </p>
        </div>
        <div className="px-6 py-4" style={{ borderTop: "1px solid var(--card-border)" }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            E-mail
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {user?.email ?? "—"}
          </p>
        </div>
        <div className="px-6 py-4" style={{ borderTop: "1px solid var(--card-border)" }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Perfis
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {user?.roles?.map((r) => ROLE_LABEL[r] ?? r).join(", ") ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
