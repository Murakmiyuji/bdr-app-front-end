import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BDR APP - Batalha de Rima em Blumenau",
  description: "Plataforma oficial da Batalha de Rima em Blumenau",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0d0d] text-[#f5f5f5]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
