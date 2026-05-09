"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AppNavbar from "@/components/AppNavbar";
import AppFooter from "@/components/AppFooter";

type AppShellProps = {
  children: ReactNode;
};

function shouldHideNavbar(pathname: string) {
  return [
    "/login",
    "/signup",
    "/forgotpassword",
    "/resetpassword",
    "/pendingapproval",
    "/approvedteacher",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getNavbarActions(pathname: string): ReactNode | undefined {
  if (pathname === "/inventario/novo") {
    return (
      <Link href="/inventario" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Voltar
      </Link>
    );
  }

  if (pathname === "/coaching") {
    return (
      <Link href="/coaching/novo" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        + Requisitar Coaching
      </Link>
    );
  }

  if (pathname === "/coaching/novo") {
    return (
      <Link href="/coaching" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Voltar
      </Link>
    );
  }

  if (pathname === "/availabilities") {
    return (
      <Link href="/availabilities/novo" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        + Marcar Disponibilidade
      </Link>
    );
  }

  if (pathname === "/availabilities/novo") {
    return (
      <Link href="/availabilities" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Voltar
      </Link>
    );
  }

  if (pathname === "/perfil/editar") {
    return (
      <Link href="/perfil" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Voltar ao perfil
      </Link>
    );
  }

  if (pathname === "/perfil/alterar-password") {
    return (
      <Link href="/perfil" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Voltar ao perfil
      </Link>
    );
  }

  if (pathname === "/professor/validar") {
    return (
      <Link href="/coaching" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Ver Coachings
      </Link>
    );
  }

  return undefined;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (shouldHideNavbar(pathname)) {
    return (
      <>
        {children}
        <AppFooter />
      </>
    );
  }

  return (
    <>
      <AppNavbar actions={getNavbarActions(pathname)} />
      {children}
      <AppFooter />
    </>
  );
}