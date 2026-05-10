// getNavbarActions define botões de ação extra na navbar (ex: "Voltar", "+ Novo").
// Páginas sem ação especial não precisam de ser listadas — a navbar aparece na mesma.
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

  if (pathname === "/availabilities") {
    return (
      <Link href="/availabilities/novo" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        + Marcar Disponibilidade
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