"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getApiBase } from "@/app/lib/apiBase";
import { animate } from "animejs";

type SessionUser = {
  id_user: number;
  name: string;
  email: string;
  id_user_type: number;
};

type NavbarLink = {
  href: string;
  label: string;
};

const linkOrder = new Map([
  ["/", 0],
  ["/dashboard", 1],
  ["/inventario", 2],
  ["/coaching", 3],
  ["/perfil", 4],
]);

type AppNavbarProps = {
  title?: string;
  subtitle?: string;
  links?: NavbarLink[];
  actions?: ReactNode;
  className?: string;
};

const defaultLinks: NavbarLink[] = [
  { href: "/", label: "Início" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventario", label: "Inventário" },
  { href: "/coaching", label: "Coachings" },
];

export default function AppNavbar({
  title,
  subtitle,
  links = defaultLinks,
  actions,
  className = "",
}: AppNavbarProps) {
  const apiBase = getApiBase();
  const pathname = usePathname();
  const [utilizador, setUtilizador] = useState<SessionUser | null>(null);
  const [loadingSessao, setLoadingSessao] = useState(true);

  const carregarSessao = useCallback(async () => {
    setLoadingSessao(true);
    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setUtilizador(null);
        return;
      }

      const data = (await res.json()) as { user: SessionUser };
      setUtilizador(data.user);
    } catch {
      setUtilizador(null);
    } finally {
      setLoadingSessao(false);
    }
  }, [apiBase]);

  const orderedLinks = [...links].sort((left, right) => {
    const leftOrder = linkOrder.get(left.href) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = linkOrder.get(right.href) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.label.localeCompare(right.label, "pt-PT");
  });

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  async function terminarSessao() {
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  }

  

  return (
   <header
  className={`sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md transition-all duration-300 ${className}`}
>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">

        {/* LOGO + TITLES */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ent'Artes Logo"
              width={144}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <div className="hidden sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Ent&apos;Artes
            </p>
            <h1 className="text-base font-semibold text-white">{title ?? ""}</h1>
            {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
          </div>
        </div>

        {/* NAV LINKS DESKTOP */}
        <nav className="hidden md:flex items-center gap-6">
          {orderedLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  active
                    ? "text-white border-b-2 border-white pb-1"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* NAV MOBILE */}
        <nav className="md:hidden flex items-center gap-3 overflow-x-auto">
          {orderedLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white text-slate-900"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* USER AREA */}
        <div className="flex items-center gap-3">
          {actions}

          {loadingSessao ? (
            <span className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
              A carregar...
            </span>
          ) : utilizador ? (
            <>
              <Link
                href="/perfil"
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  pathname === "/perfil"
                    ? "border-white bg-white text-slate-900"
                    : "border-slate-600 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {utilizador.name}
              </Link>

              <button
                onClick={terminarSessao}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
              >
                Registar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
