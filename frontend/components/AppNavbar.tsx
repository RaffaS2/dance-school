"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getApiBase } from "@/app/lib/apiBase";


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
  ["/dashboard", 0],
  ["/inventario", 1],
  ["/coaching", 2],
  ["/perfil", 3],
]);

type AppNavbarProps = {
  title?: string;
  subtitle?: string;
  links?: NavbarLink[];
  actions?: ReactNode;
  className?: string;
};

const defaultLinks: NavbarLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventario", label: "Inventário" },
  { href: "/coaching", label: "Coachings" },
];

export default function AppNavbar({
  links = defaultLinks,
  actions,
  className = "",
}: AppNavbarProps) {
  const apiBase = getApiBase();
  const pathname = usePathname();
  const [utilizador, setUtilizador] = useState<SessionUser | null>(null);
  const [loadingSessao, setLoadingSessao] = useState(true);
const [dropdownAberto, setDropdownAberto] = useState(false);

const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  function handleClickFora(e: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownAberto(false);
    }
  }

  document.addEventListener("mousedown", handleClickFora);
  return () => document.removeEventListener("mousedown", handleClickFora);
}, []);

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
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
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
  className={`sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md ${className}`}
>
  <div className="mx-auto flex w-full max-w-7xl items-center gap-8 px-6 h-16">

    {/* LOGO — maior que a navbar, centrado verticalmente */}
    <Link href="/" className="shrink-0 -my-4">
      <Image
        src="/logo.png"
        alt="Ent'Artes Logo"
        width={160}
        height={80}
        className="h-20 w-auto object-contain brightness-0 invert"
      />
    </Link>


        {/* NAV LINKS DESKTOP — ao lado do logo */}
        <nav className="hidden md:flex items-center gap-6">
          {orderedLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition ${
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

        {/* ESPAÇO ENTRE NAV E USER */}
        <div className="flex-1" />

        {/* USER AREA */}
<div className="flex items-center gap-3">
  {actions}

  {loadingSessao ? (
    <span className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
      A carregar...
    </span>
  ) : utilizador ? (
    <div className="relative" ref={dropdownRef}>
     <button
  onClick={() => setDropdownAberto(!dropdownAberto)}
  className="flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition cursor-pointer"
>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900">
          {utilizador.name.charAt(0).toUpperCase()}
        </span>
        {utilizador.name}
        <svg
          className={`h-4 w-4 transition-transform ${dropdownAberto ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownAberto && (
  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-md py-2 shadow-2xl">
    <div className="px-4 py-2 border-b border-slate-700/60 mb-1">
      <p className="text-xs text-slate-400 truncate">{utilizador.email}</p>
    </div>
    <Link
      href="/perfil"
      onClick={() => setDropdownAberto(false)}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:text-white hover:bg-slate-800/60 transition rounded-lg mx-1"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
        {utilizador.name.charAt(0).toUpperCase()}
      </span>
      Perfil
    </Link>
    <button
  onClick={terminarSessao}
  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition rounded-lg mx-1 cursor-pointer"
>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700/50 text-xs">
        ✕
      </span>
      Terminar sessão
    </button>
  </div>
)}
</div>
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

      </div>
    </header>
  );
}