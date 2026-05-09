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

// Definição dos links por tipo de utilizador
const ROLE_LINKS: Record<number, NavbarLink[]> = {
  1: [ // Admin
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/estudios", label: "Estúdios" },
    { href: "/inventario", label: "Inventário" },
    { href: "/coaching", label: "Coachings" },
  ],
  2: [ // Professor
    { href: "/professor/validar", label: "Validação de aulas" },
    { href: "/calendario", label: "Calendário" },
    { href: "/inventario", label: "Inventário" },
    { href: "/coaching", label: "Coachings" },
  ],
  3: [ // EE (Alunos)
    { href: "/calendario", label: "Calendário" },
    { href: "/inventario", label: "Inventário" },
    { href: "/coaching", label: "Coachings" },
    // { href: "/alunos", label: "Gerir Alunos" },
  ],
};

const linkOrder = new Map([
  ["/dashboard", 0],
  ["/estudios", 1],
  ["/calendario", 2],
  ["/inventario", 3],
  ["/coaching", 4],
  ["/alunos", 5],
]);

type AppNavbarProps = {
  actions?: ReactNode;
  className?: string;
};

export default function AppNavbar({
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

  // Função para redirecionar o Logo com base no tipo de utilizador
  const getLogoHref = () => {
    if (!utilizador) return "/";
    switch (utilizador.id_user_type) {
      case 1: return "/admin/dashboard";    // Admin
      case 2: return "/calendario";   // Professor
      case 3: return "/calendario";   // EE / Alunos
      default: return "/";
    }
  };

  const linksParaMostrar = utilizador 
    ? ROLE_LINKS[utilizador.id_user_type] || [] 
    : [];

  const orderedLinks = [...linksParaMostrar].sort((left, right) => {
    const leftOrder = linkOrder.get(left.href) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = linkOrder.get(right.href) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[#847a92]/30 bg-[#847a92]/60 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-8 px-6 h-16">
        
        {/* LOGO DINÂMICO */}
        <Link href={getLogoHref()} className="shrink-0 -my-4">
          <Image
            src="/logo.png"
            alt="Ent'Artes Logo"
            width={160}
            height={80}
            className="h-20 w-auto object-contain brightness-0 invert"
          />
        </Link>

        {/* NAV LINKS DESKTOP */}
        <nav className="hidden md:flex items-center gap-6">
          {orderedLinks.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition ${
                  active ? "text-white border-b-2 border-white pb-1" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* USER AREA */}
        <div className="flex items-center gap-3">
          {actions}

          {loadingSessao ? (
            <span className="rounded-full px-4 py-2 text-sm text-white/60">A carregar...</span>
          ) : utilizador ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownAberto(!dropdownAberto)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition cursor-pointer"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#847a92]">
                  {utilizador.name.charAt(0).toUpperCase()}
                </span>
                {utilizador.name}
              </button>

              {dropdownAberto && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-[#847a92]/95 backdrop-blur-lg py-2 shadow-2xl">
                  <div className="px-4 py-2 mb-1 border-b border-white/10">
                    <p className="text-xs text-white/60 truncate">{utilizador.email}</p>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setDropdownAberto(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition rounded-lg mx-1"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={terminarSessao}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-red-300 hover:bg-white/10 transition rounded-lg mx-1 cursor-pointer"
                  >
                    Terminar sessão
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
              Entrar
            </Link>
          )}
        </div>

        {/* NAV MOBILE */}
        <nav className="md:hidden flex items-center gap-2 overflow-x-auto pb-2">
          {orderedLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  active ? "bg-white text-[#847a92]" : "bg-white/10 text-white"
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