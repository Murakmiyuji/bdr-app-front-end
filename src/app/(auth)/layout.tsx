import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--background)" }}>
      {/* Logo */}
      <div className="mb-8 text-center select-none">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
          style={{ background: "var(--primary)" }}>
          <span className="text-white font-black text-2xl tracking-tighter">BDR</span>
        </div>
        <p className="text-xs uppercase tracking-widest"
          style={{ color: "var(--muted-foreground)" }}>
          Batalha de Rima · Blumenau
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg rounded-2xl p-8 shadow-xl border"
        style={{
          background: "var(--card)",
          borderColor: "var(--card-border)",
        }}>
        {children}
      </div>

      <p className="mt-6 text-xs" style={{ color: "var(--muted-foreground)" }}>
        © {new Date().getFullYear()} BDR APP. Todos os direitos reservados.
      </p>
    </div>
  );
}
