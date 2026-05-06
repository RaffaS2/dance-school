/*
 layout.tsx

 Layout raiz da aplicação Next.js. Este ficheiro define fontes globais e
 metadata e envolve todas as páginas com o `AppShell`, responsável por
 renderizar a `AppNavbar` partilhada e o conteúdo da página. Mantenha aqui
 o chrome global (fontes, metadata) e evite duplicar a lógica do cabeçalho
 nas páginas.
*/

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dance School",
  description: "Escola de dança",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppShell>
          <main>{children}</main>
        </AppShell>
      </body>
    </html>
  );
}