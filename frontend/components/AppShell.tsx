"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AppNavbar from "@/components/AppNavbar";
import AppFooter from "@/components/AppFooter";

type AppShellProps = {
	children: ReactNode;
};

const sharedLinks = [
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/inventario", label: "Inventário" },
	{ href: "/coaching", label: "Coachings" },
];

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

function getNavbarForPath(pathname: string) {
	if (pathname === "/") {
		return { title: "Página Inicial", subtitle: "Escola de dança", links: sharedLinks };
	}

	if (pathname === "/dashboard") {
		return { title: "Dashboard", links: sharedLinks };
	}

	if (pathname === "/inventario") {
		return { title: "Inventário", links: sharedLinks };
	}


	if (pathname === "/inventario/novo") {
		return {
			title: "Adicionar Item",
			links: sharedLinks,
			actions: (
				<Link
					href="/inventario"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Voltar
				</Link>
			),
		};
	}

	if (pathname === "/coaching") {
		return {
			title: "Os meus Coachings",
			links: sharedLinks,
			actions: (
				<Link
					href="/coaching/novo"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					+ Requisitar Coaching
				</Link>
			),
		};
	}

	if (pathname === "/coaching/novo") {
		return {
			title: "Requisitar Coaching",
			links: sharedLinks,
			actions: (
				<Link
					href="/coaching"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Voltar
				</Link>
			),
		};
	}

	if (pathname === "/availabilities") {
		return {
			title: "Disponibilidades",
			links: sharedLinks,
			actions: (
				<Link
					href="/availabilities/novo"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					+ Marcar Disponibilidade
				</Link>
			),
		};
	}

	if (pathname === "/availabilities/novo") {
		return {
			title: "Nova Disponibilidade",
			links: sharedLinks,
			actions: (
				<Link
					href="/availabilities"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Voltar
				</Link>
			),
		};
	}

	if (pathname === "/perfil") {
		return { title: "Perfil", links: sharedLinks };
	}

	if (pathname === "/perfil/editar") {
		return {
			title: "Editar Perfil",
			links: sharedLinks,
			actions: (
				<Link
					href="/perfil"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Voltar ao perfil
				</Link>
			),
		};
	}

	if (pathname === "/perfil/alterar-password") {
		return {
			title: "Alterar palavra-passe",
			links: sharedLinks,
			actions: (
				<Link
					href="/perfil"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Voltar ao perfil
				</Link>
			),
		};
	}

	if (pathname === "/professor/validar") {
		return {
			title: "Validar Aulas",
			subtitle: "Escola de Dança",
			links: sharedLinks,
			actions: (
				<Link
					href="/coaching"
					className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Ver Coachings
				</Link>
			),
		};
	}

	if (pathname === "/admin/studios") {
		return { title: "Gerenciar Estúdios e Modalidades", links: sharedLinks };
	}

	return null;
}

export default function AppShell({ children }: AppShellProps) {
	const pathname = usePathname();
	const navbar = shouldHideNavbar(pathname) ? null : getNavbarForPath(pathname);

	return (
		<>
			{navbar ? <AppNavbar {...navbar} /> : null}
			{children}
			<AppFooter />
		</>
	);
}