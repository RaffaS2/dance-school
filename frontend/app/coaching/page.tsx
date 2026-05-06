"use client";

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
	id_professor?: number;
	id_studio?: number;
	id_modality?: number;
	professor: string;
	modalidade: string;
	estudio: string;
	aluno?: string;
	date: string;
	start_time: string;
	duration_minutes: number;
	status: string;
	price: number;
	professor_validation?: boolean | null;
	guardian_validation?: boolean | null;
	coordination_validation?: boolean | null;
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

function podeCancelar(status: string) {
	const s = status?.toLowerCase() ?? "";
	return !s.includes("cancelado");
}

export default function CoachingPage() {
	const apiBase = getApiBase();

	const [utilizadorAtual, setUtilizadorAtual] = useState<SessionUser | null>(null);
	const [loadingSessao, setLoadingSessao] = useState(true);
	const [coachings, setCoachings] = useState<ApiCoaching[]>([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");
	const [cancelandoId, setCelandoId] = useState<number | null>(null);

	const carregarSessao = useCallback(async () => {
		setLoadingSessao(true);
		try {
			const res = await fetch(`${apiBase}/auth/me`, {
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


	// ── 2. Carregar coachings ───────────────────────────────────────────────

	const carregarCoachings = useCallback(
		async (user: SessionUser) => {
			setErro("");
			setLoading(true);
			try {
				let url = "";

				if (user.id_user_type === 2) {
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
					url = `${apiBase}/coachings`;
				} else {
					url = `${apiBase}/coachings/guardian/${user.id_user}`;
				}

				const res = await fetch(url, { credentials: "include" });
				if (!res.ok) throw new Error("Falha ao carregar coachings.");
				const data = (await res.json()) as ApiCoaching[];
				setCoachings(data);
			} catch {
				setErro("Não foi possível carregar os coachings.");
			} finally {
				setLoading(false);
			}
		},
		[apiBase],
	);


	// ── 3. Cancelar coaching ────────────────────────────────────────────────
	const cancelarCoaching = async (coaching: ApiCoaching) => {
		const confirmado = window.confirm(
			`Tens a certeza que queres cancelar o coaching de ${formatDate(coaching.date)} às ${coaching.start_time?.slice(0, 5)}?`
		);
		if (!confirmado) return;

		setCelandoId(coaching.id_coaching);
		setErro("");

		try {
			// Busca os detalhes completos para o PUT
			const detailRes = await fetch(`${apiBase}/coachings/${coaching.id_coaching}`, {
				credentials: "include",
			});
			if (!detailRes.ok) throw new Error("Não foi possível ler os dados do coaching.");

			const detailPayload = await detailRes.json();
			const detail = Array.isArray(detailPayload) ? detailPayload[0] : detailPayload;

			if (!detail) throw new Error("Coaching não encontrado.");

			const updateRes = await fetch(`${apiBase}/coachings/${coaching.id_coaching}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					id_professor: detail.id_professor,
					id_studio: detail.id_studio,
					id_modality: detail.id_modality,
					date: detail.date,
					start_time: detail.start_time,
					duration_minutes: detail.duration_minutes,
					status: "cancelado",
					price: detail.price,
					professor_validation: detail.professor_validation,
					guardian_validation: detail.guardian_validation,
					coordination_validation: detail.coordination_validation,
				}),
			});

			if (!updateRes.ok) throw new Error("Não foi possível cancelar o coaching.");

			// Recarrega a lista
			if (utilizadorAtual) await carregarCoachings(utilizadorAtual);
		} catch (err) {
			setErro(err instanceof Error ? err.message : "Erro ao cancelar coaching.");
		} finally {
			setCelandoId(null);
		}
	};

	// ── 4. Efeitos ──────────────────────────────────────────────────────────

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

	// ── 5. Render ───────────────────────────────────────────────────────────

	return (
		<div className="min-h-screen bg-gray-100 text-zinc-900">
			<div className="mx-auto w-full max-w-6xl space-y-6 px-6 pt-6 pb-8">
				{!loadingSessao && !utilizadorAtual && (
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow">
						Sessão não encontrada. Inicia sessão em{" "}
						<Link href="/login" className="font-semibold underline">
							/login
						</Link>{" "}
						para veres os teus coachings.
					</div>
				)}

				{loading && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow">
						A carregar coachings...
					</div>
				)}

				{erro && (
					<div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow">
						{erro}
					</div>
				)}

				{!loading && utilizadorAtual && (
					<div className="rounded-xl bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Resumo</h2>
						<p className="mt-1 text-sm text-gray-600">
							Tens <strong>{coachings.length}</strong> coaching(s) registado(s).
						</p>
					</div>
				)}

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

									{/* Botão cancelar */}
									{podeCancelar(c.status) && (
										<button
											onClick={() => cancelarCoaching(c)}
											disabled={cancelandoId === c.id_coaching}
											className="mt-3 w-full rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{cancelandoId === c.id_coaching ? "A cancelar..." : "Cancelar Coaching"}
										</button>
									)}
								</article>
							))
						)}
					</section>
				)}
			</div>
		</div>
	);
}
