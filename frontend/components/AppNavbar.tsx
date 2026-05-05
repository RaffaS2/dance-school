"use client";

/*
 AppNavbar.tsx

 Componente reutilizável e apresentacional da barra de navegação.

 Propósito e comportamento:
 - Renderiza o logo, o `title` da página (e opcional `subtitle`), um
	 conjunto de `links` de navegação e `actions` opcionais à direita.
 - Mostra o nome do utilizador autenticado (quando presente) e um botão
	 de logout.
 - Usa uma ordem fixa de links e destaca o link ativo com `usePathname()`
	 para manter a navegação estável entre páginas.

 API:
 - Props: `title?: string`, `subtitle?: string`, `links?: NavbarLink[]`,
	 `actions?: ReactNode`, `className?: string`.

 Notas:
 - Destina-se a ser controlado por um shell a nível de aplicação (ver
	 `AppShell.tsx`).
 - Evite importar e renderizar este componente diretamente nas páginas
	 quando o `AppShell` estiver em uso; centralize as decisões da navbar no
	 `AppShell`.
*/

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
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
		<header className={`sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur ${className}`}>
			<div className="mx-auto grid w-full max-w-7xl gap-4 px-6 py-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
				<div className="flex items-center gap-4">
					<Link href="/" className="flex items-center gap-4">
						<Image
							src="/logo.png"
							alt="Ent'Artes Logo"
							width={144}
							height={48}
							className="h-12 w-auto object-contain"
						/>
					</Link>
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Ent&apos;Artes</p>
						<h1 className="text-lg font-semibold text-slate-900">{title ?? ""}</h1>
						{subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
					</div>
				</div>

				<nav className="flex flex-nowrap items-center gap-2 overflow-x-auto lg:justify-center">
					{orderedLinks.map((link) => {
						const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
									active
										? "bg-slate-900 text-white shadow-sm"
										: "bg-slate-100 text-slate-700 hover:bg-slate-200"
								}`}
							>
								{link.label}
							</Link>
						);
					})}
				</nav>

				<div className="flex min-w-0 flex-wrap items-center gap-3 lg:justify-end">
					{actions}

					{loadingSessao ? (
						<span className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500">
							A carregar...
						</span>
					) : utilizador ? (
						<>
							<Link
								href="/perfil"
								className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
									pathname === "/perfil"
										? "border-slate-900 bg-slate-900 text-white shadow-sm"
										: "border-slate-300 text-slate-700 hover:bg-slate-50"
								}`}
							>
								{utilizador.name}
							</Link>
							<button
								onClick={terminarSessao}
								className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
							>
								Sair
							</button>
						</>
					) : (
						<>
							<Link
								href="/login"
								className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
							>
								Entrar
							</Link>
							<Link
								href="/signup"
								className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
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
