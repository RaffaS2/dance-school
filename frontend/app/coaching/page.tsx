"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getApiBase } from "../lib/apiBase";

type SessionUser = {
	id_user: number;
	name: string;
	email: string;
	id_user_type: number;
};

type ApiCoaching = {
	id_coaching: number;
	professor: string;
	modalidade: string;
	estudio: string;
	aluno?: string; // só vem no endpoint do encarregado
	date: string;
	start_time: string;
	duration_minutes: number;
	status: string;
	price: number;
};

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("pt-PT");
}

function estadoColor(status: string) {
	switch (status?.toLowerCase()) {
		case "confirmado":
			return "bg-green-100 text-green-700";
		case "pendente":
			return "bg-amber-100 text-amber-700";
		case "cancelado":
			return "bg-rose-100 text-rose-700";
		default:
			return "bg-gray-100 text-gray-600";
	}
}

export default function CoachingPage() {
	const apiBase = getApiBase();

	const [utilizadorAtual, setUtilizadorAtual] = useState<SessionUser | null>(null);
	const [loadingSessao, setLoadingSessao] = useState(true);
	const [coachings, setCoachings] = useState<ApiCoaching[]>([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");

	// ── 1. Carregar sessão ──────────────────────────────────────────────────
	const carregarSessao = useCallback(async () => {
		setLoadingSessao(true);
		try {
			const res = await fetch(`${apiBase}/api/auth/me`, {
				credentials: "include",
			});
			if (!res.ok) {
				setUtilizadorAtual(null);
				return;
			}
			const data = (await res.json()) as { user: SessionUser };
			setUtilizadorAtual(data.user);
		} catch {
			setUtilizadorAtual(null);
		} finally {
			setLoadingSessao(false);
		}
	}, [apiBase]);

	// ── 2. Carregar coachings filtrados por tipo de utilizador ──────────────
	const carregarCoachings = useCallback(
		async (user: SessionUser) => {
			setErro("");
			setLoading(true);
			try {
				let url = "";

				if (user.id_user_type === 2) {
					// Professor → descobre o id_professor a partir do id_user
					const profRes = await fetch(`${apiBase}/professors`, {
						credentials: "include",
					});
					if (!profRes.ok) throw new Error("Falha ao carregar professores.");
					const profs = (await profRes.json()) as {
						id_professor: number;
						id_user: number;
					}[];
					const prof = profs.find((p) => p.id_user === user.id_user);
					if (!prof) {
						setCoachings([]);
						return;
					}
					url = `${apiBase}/coachings/professor/${prof.id_professor}`;
				} else if (user.id_user_type === 1) {
					// Admin → vê todos
					url = `${apiBase}/coachings`;
				} else {
					// Encarregado / aluno → filtra pelos seus educandos
					url = `${apiBase}/coachings/guardian/${user.id_user}`;
				}

				const res = await fetch(url, { credentials: "include" });
				if (!res.ok) throw new Error("Falha ao carregar coachings.");
				const data = (await res.json()) as ApiCoaching[];
				setCoachings(data);
			} catch (error) {
				setErro("Não foi possível carregar os coachings.");
			} finally {
				setLoading(false);
			}
		},
		[apiBase],
	);

	// ── 3. Efeitos ──────────────────────────────────────────────────────────
	useEffect(() => {
		void carregarSessao();
	}, [carregarSessao]);

	useEffect(() => {
		if (!loadingSessao && utilizadorAtual) {
			void carregarCoachings(utilizadorAtual);
		} else if (!loadingSessao && !utilizadorAtual) {
			setLoading(false);
		}
	}, [loadingSessao, utilizadorAtual, carregarCoachings]);

	// ── 4. Render ───────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-gray-100 text-zinc-900">
			{/* Header */}
			<header className="mb-6 bg-white px-6 py-4 shadow">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-4">
						<Image
							src="/logo.png"
							alt="Ent'Artes Logo"
							width={144}
							height={48}
							className="h-12 w-auto object-contain"
						/>
						<div>
							<h1 className="text-xl font-bold">Os meus Coachings</h1>
							<p className="text-sm text-gray-600">
								Utilizador: {utilizadorAtual?.name ?? "Não autenticado"}
							</p>
						</div>
					</div>

					<div className="flex gap-3">
						<Link href="/">
							<button className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
								Página Inicial
							</button>
						</Link>
						<Link href="/coaching/novo">
							<button className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
								+ Requisitar Coaching
							</button>
						</Link>
					</div>
				</div>
			</header>

			<div className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-8">
				{/* Aviso de sessão */}
				{!loadingSessao && !utilizadorAtual && (
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow">
						Sessão não encontrada. Inicia sessão em{" "}
						<Link href="/login" className="font-semibold underline">
							/login
						</Link>{" "}
						para veres os teus coachings.
					</div>
				)}

				{/* Loading */}
				{loading && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow">
						A carregar coachings...
					</div>
				)}

				{/* Erro */}
				{erro && (
					<div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow">
						{erro}
					</div>
				)}

				{/* Resumo */}
				{!loading && utilizadorAtual && (
					<div className="rounded-xl bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Resumo</h2>
						<p className="mt-1 text-sm text-gray-600">
							Tens <strong>{coachings.length}</strong> coaching(s) registado(s).
						</p>
					</div>
				)}

				{/* Lista de coachings */}
				{!loading && utilizadorAtual && (
					<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{coachings.length === 0 ? (
							<div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
								Sem coachings disponíveis.
							</div>
						) : (
							coachings.map((c) => (
								<article
									key={c.id_coaching}
									className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
								>
									<div className="mb-3 flex items-center justify-between">
										<p className="font-semibold">
											{c.modalidade} — {c.estudio}
										</p>
										<span
											className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoColor(c.status)}`}
										>
											{c.status}
										</span>
									</div>

									{/* Só o encarregado vê o nome do aluno */}
									{c.aluno && (
										<p className="mb-1 text-sm font-medium text-blue-600">
											Aluno: {c.aluno}
										</p>
									)}

									<p className="text-sm text-gray-600">Professor: {c.professor}</p>
									<p className="mt-1 text-xs text-gray-500">
										Data: {formatDate(c.date)}
									</p>
									<p className="text-xs text-gray-500">
										Hora: {c.start_time?.slice(0, 5)}
									</p>
									<p className="text-xs text-gray-500">
										Duração: {c.duration_minutes} min
									</p>
									<p className="text-xs text-gray-500">
										Preço: {c.price}€
									</p>
								</article>
							))
						)}
					</section>
				)}
			</div>
		</div>
	);
}