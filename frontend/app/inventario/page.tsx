"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getApiBase } from "../lib/apiBase";

type ItemStatusFilter = "todos" | "disponivel" | "em-uso" | "sem-stock";

type ApiItem = {
	id_item: number;
	name: string;
	status: number;
	id_category: number;
};

type ApiCategory = {
	id_category: number;
	name: string;
};

type ApiItemRequest = {
	id_item_request: number;
	request_date: string;
	return_date: string | null;
	id_item: number;
	id_user: number;
	delivery_status: number;
	request_status: number;
};

type InventoryItem = {
	id: number;
	nome: string;
	categoria: string;
	status: number;
	visual: string;
	adicionadoPorUtilizador: boolean;
};

type SessionUser = {
	id_user: number;
	name: string;
	email: string;
	id_user_type: number;
};

function initials(value: string) {
	return value
		.split(" ")
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("")
		.slice(0, 2);
}

function isActiveRequest(request: ApiItemRequest) {
	return !request.return_date;
}

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("pt-PT");
}

function hojeISO() {
	return new Date().toISOString().split("T")[0];
}

function estadoDoItem(emPosseDoUtilizador: boolean, itemBloqueado: boolean) {
	if (emPosseDoUtilizador) return "Em Uso";
	if (itemBloqueado) return "Sem Stock";
	return "Disponível";
}

function estadoInternoItem(status: number) {
	if (status === 1) return "Disponível";
	if (status === 2) return "Em Uso";
	if (status === 3) return "Inativo";
	return "Desconhecido";
}

async function getApiErrorMessage(response: Response, fallback: string) {
	try {
		const data = (await response.json()) as { error?: string; message?: string };
		return data.error || data.message || fallback;
	} catch {
		return fallback;
	}
}

export default function InventoryPage() {
	const apiBase = getApiBase();
	const [utilizadorAtual, setUtilizadorAtual] = useState<SessionUser | null>(null);
	const [loadingSessao, setLoadingSessao] = useState(true);
	const [itens, setItens] = useState<InventoryItem[]>([]);
	const [categoriasApi, setCategoriasApi] = useState<ApiCategory[]>([]);
	const [requisicoes, setRequisicoes] = useState<ApiItemRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [itemEmAcao, setItemEmAcao] = useState<number | null>(null);

	const [pesquisa, setPesquisa] = useState("");
	const [filtroCategoria, setFiltroCategoria] = useState("todas");
	const [filtroEstado, setFiltroEstado] = useState<ItemStatusFilter>("todos");

	const [novoNome, setNovoNome] = useState("");
	const [novaCategoria, setNovaCategoria] = useState("");

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

	const carregarDados = useCallback(async () => {
		setErro("");
		setLoading(true);
		try {
			const [itemsRes, categoriesRes, requestsRes] = await Promise.all([
				fetch(`${apiBase}/items`, { cache: "no-store", credentials: "include" }),
				fetch(`${apiBase}/categories`, { cache: "no-store", credentials: "include" }),
				fetch(`${apiBase}/item-requests`, { cache: "no-store", credentials: "include" }),
			]);

			if (!itemsRes.ok || !categoriesRes.ok || !requestsRes.ok) {
				throw new Error("Falha ao carregar dados do inventário.");
			}

			const [itemsData, categoriesData, requestsData] = (await Promise.all([
				itemsRes.json(),
				categoriesRes.json(),
				requestsRes.json(),
			])) as [ApiItem[], ApiCategory[], ApiItemRequest[]];

			const categoriesById = new Map<number, string>(
				categoriesData.map((category) => [category.id_category, category.name]),
			);

			setCategoriasApi(categoriesData);
			setRequisicoes(requestsData);
			setItens(
				itemsData.map((item) => ({
					id: item.id_item,
					nome: item.name,
					categoria: categoriesById.get(item.id_category) ?? "Sem categoria",
					status: item.status,
					visual: initials(item.name),
					adicionadoPorUtilizador: true,
				})),
			);
		} catch (error) {
			setErro("Não foi possível carregar o inventário.");
		} finally {
			setLoading(false);
		}
	}, [apiBase]);

	useEffect(() => {
		void carregarSessao();
	}, [carregarSessao]);

	useEffect(() => {
		void carregarDados();
	}, [carregarDados]);

	const categorias = useMemo(() => {
		const todas = itens.map((item) => item.categoria);
		return [...new Set(todas)].sort((a, b) => a.localeCompare(b));
	}, [itens]);

	const requisicoesAtivasGerais = useMemo(() => {
		return requisicoes.filter((request) => isActiveRequest(request));
	}, [requisicoes]);

	const requisicoesAtivasDoUtilizador = useMemo(() => {
		if (!utilizadorAtual) return [];
		return requisicoesAtivasGerais.filter((request) => request.id_user === utilizadorAtual.id_user);
	}, [requisicoesAtivasGerais, utilizadorAtual]);

	const requisicaoAtivaPorItem = useMemo(() => {
		const map = new Map<number, ApiItemRequest>();
		for (const request of requisicoesAtivasDoUtilizador) {
			map.set(request.id_item, request);
		}
		return map;
	}, [requisicoesAtivasDoUtilizador]);

	const itemBloqueadoPorOutraRequisicao = useMemo(() => {
		const map = new Map<number, boolean>();

		if (!utilizadorAtual) {
			return map;
		}

		for (const request of requisicoesAtivasGerais) {
			const emPosseDoUtilizadorAtual = utilizadorAtual
				? request.id_user === utilizadorAtual.id_user
				: false;
			if (!emPosseDoUtilizadorAtual) {
				map.set(request.id_item, true);
			}
		}
		return map;
	}, [requisicoesAtivasGerais, utilizadorAtual]);

	const requisicoesAtivas = useMemo(() => {
		return itens.filter((item) => requisicaoAtivaPorItem.has(item.id));
	}, [itens, requisicaoAtivaPorItem]);

	const itensFiltrados = useMemo(() => {
		return itens.filter((item) => {
			const emPosseDoUtilizador = requisicaoAtivaPorItem.has(item.id);
			const itemBloqueado = Boolean(itemBloqueadoPorOutraRequisicao.get(item.id));
			const estado = estadoDoItem(emPosseDoUtilizador, itemBloqueado);
			const textoOk = `${item.nome} ${item.categoria}`
				.toLowerCase()
				.includes(pesquisa.toLowerCase());

			const categoriaOk = filtroCategoria === "todas" || item.categoria === filtroCategoria;

			const estadoOk =
				filtroEstado === "todos" ||
				(filtroEstado === "disponivel" && estado === "Disponível") ||
				(filtroEstado === "em-uso" && estado === "Em Uso") ||
				(filtroEstado === "sem-stock" && estado === "Sem Stock");

			return textoOk && categoriaOk && estadoOk;
		});
	}, [itens, requisicaoAtivaPorItem, itemBloqueadoPorOutraRequisicao, pesquisa, filtroCategoria, filtroEstado]);

	async function requisitarItem(item: InventoryItem) {
		if (!utilizadorAtual) {
			alert("Precisas de iniciar sessão para requisitar itens.");
			return;
		}

		if (requisicaoAtivaPorItem.has(item.id) || itemBloqueadoPorOutraRequisicao.get(item.id)) return;
		setItemEmAcao(item.id);
		try {
			const res = await fetch(`${apiBase}/item-requests`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					request_date: hojeISO(),
					return_date: null,
					id_item: item.id,
					id_user: utilizadorAtual.id_user,
					delivery_status: 1,
					request_status: 1,
				}),
			});

			if (!res.ok) {
				const message = await getApiErrorMessage(res, "Falha ao requisitar item");
				throw new Error(message);
			}
			await carregarDados();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Não foi possível requisitar o item.";
			alert(message);
		} finally {
			setItemEmAcao(null);
		}
	}

	async function devolverItem(item: InventoryItem) {
		const request = requisicaoAtivaPorItem.get(item.id);
		if (!request) return;

		setItemEmAcao(item.id);
		try {
			const res = await fetch(`${apiBase}/item-requests/${request.id_item_request}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					request_date: request.request_date,
					return_date: hojeISO(),
					id_item: request.id_item,
					id_user: request.id_user,
					delivery_status: request.delivery_status,
					request_status: request.request_status,
				}),
			});

			if (!res.ok) {
				const message = await getApiErrorMessage(res, "Falha ao devolver item");
				throw new Error(message);
			}
			await carregarDados();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Não foi possível devolver o item.";
			alert(message);
		} finally {
			setItemEmAcao(null);
		}
	}

	async function garantirCategoria(categoriaNome: string) {
		const existente = categoriasApi.find(
			(category) => category.name.toLowerCase() === categoriaNome.toLowerCase(),
		);
		if (existente) return existente.id_category;

		const res = await fetch(`${apiBase}/categories`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ name: categoriaNome }),
		});

		if (!res.ok) {
			const message = await getApiErrorMessage(res, "Não foi possível criar categoria");
			throw new Error(message);
		}
		const category = (await res.json()) as ApiCategory;
		setCategoriasApi((current) => [category, ...current]);
		return category.id_category;
	}

	async function adicionarNovoItem(evento: FormEvent<HTMLFormElement>) {
		evento.preventDefault();
		if (!novoNome.trim() || !novaCategoria.trim()) return;

		setSubmitting(true);
		try {
			const idCategoria = await garantirCategoria(novaCategoria.trim());
			const res = await fetch(`${apiBase}/items`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					name: novoNome.trim(),
					status: 1,
					id_category: idCategoria,
				}),
			});

			if (!res.ok) {
				const message = await getApiErrorMessage(res, "Falha ao criar item");
				throw new Error(message);
			}
			setNovoNome("");
			setNovaCategoria("");
			await carregarDados();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Não foi possível guardar o item.";
			alert(message);
		} finally {
			setSubmitting(false);
		}
	}

	async function removerItem(item: InventoryItem) {
		const emPosseDoUtilizadorAtual = requisicaoAtivaPorItem.has(item.id);
		if (emPosseDoUtilizadorAtual) {
			alert("Não é possível remover este item enquanto estiver em teu poder.");
			return;
		}

		const confirmado = window.confirm(`Remover o item \"${item.nome}\" do inventário?`);
		if (!confirmado) return;

		setItemEmAcao(item.id);
		try {
			const res = await fetch(`${apiBase}/items/${item.id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) {
				const message = await getApiErrorMessage(res, "Falha ao remover item");
				throw new Error(message);
			}
			await carregarDados();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Não foi possível remover o item.";
			alert(message);
		} finally {
			setItemEmAcao(null);
		}
	}

	return (
		<div className="min-h-screen bg-gray-100 text-zinc-900">
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
							<h1 className="text-xl font-bold">Inventário</h1>
							<p className="text-sm text-gray-600">
								Utilizador atual: {utilizadorAtual?.name ?? "Não autenticado"}
							</p>
						</div>
					</div>

					<div className="flex gap-3">
						<Link href="/">
							<button className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
								Página Inicial
							</button>
						</Link>
						<Link href="/coaching">
							<button className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
								Coachings
							</button>
						</Link>
					</div>
				</div>
			</header>

			<div className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-8">
				{!loadingSessao && !utilizadorAtual && (
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow">
						Sessão não encontrada. Inicia sessão em
						{" "}
						<Link href="/login" className="font-semibold underline">
							/login
						</Link>
						{" "}
						para veres as tuas requisições corretamente.
					</div>
				)}

				{loading && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow">
						A carregar inventário...
					</div>
				)}

				{erro && (
					<div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow">
						{erro}
					</div>
				)}

				<section className="grid gap-4 md:grid-cols-2">
					<div className="rounded-xl bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Minhas Requisições Ativas</h2>
						<p className="mt-1 text-sm text-gray-600">
							Tem <strong>{requisicoesAtivas.length}</strong> item(ns) em uso.
						</p>

						<div className="mt-4 space-y-3">
							{requisicoesAtivas.length === 0 && (
								<div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
									Sem itens ativos no momento.
								</div>
							)}

							{requisicoesAtivas.map((item) => (
								<article key={item.id} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="font-semibold">{item.nome}</h3>
											<p className="mt-1 text-xs text-gray-500">
												Em uso desde: {formatDate(requisicaoAtivaPorItem.get(item.id)?.request_date ?? hojeISO())}
											</p>
										</div>
										<span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">Em Uso</span>
									</div>
								</article>
							))}
						</div>
					</div>

					<form onSubmit={adicionarNovoItem} className="rounded-xl bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Adicionar Novo Item</h2>
						<p className="mt-1 text-sm text-gray-600">
							Itens adicionados aqui podem ser removidos se não estiverem em uso.
						</p>

						<div className="mt-4 space-y-3">
							<input
								value={novoNome}
								onChange={(e) => setNovoNome(e.target.value)}
								placeholder="Nome do item"
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
							/>
							<input
								value={novaCategoria}
								onChange={(e) => setNovaCategoria(e.target.value)}
								placeholder="Categoria (ex: Material Didático)"
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
							/>
						</div>

						<button
							type="submit"
							disabled={submitting}
							className="mt-4 w-full rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
						>
							{submitting ? "A guardar..." : "Guardar Item"}
						</button>
					</form>
				</section>

				<section className="rounded-xl bg-white p-5 shadow">
					<h2 className="text-lg font-semibold">Filtros</h2>
					<div className="mt-3 grid gap-3 md:grid-cols-3">
						<input
							value={pesquisa}
							onChange={(e) => setPesquisa(e.target.value)}
							placeholder="Pesquisar itens"
							className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
						/>

						<select
							value={filtroCategoria}
							onChange={(e) => setFiltroCategoria(e.target.value)}
							className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
						>
							<option value="todas">Todas as Categorias</option>
							{categorias.map((categoria) => (
								<option key={categoria} value={categoria}>
									{categoria}
								</option>
							))}
						</select>

						<select
							value={filtroEstado}
							onChange={(e) => setFiltroEstado(e.target.value as ItemStatusFilter)}
							className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
						>
							<option value="todos">Todos os Estados</option>
							<option value="disponivel">Disponível</option>
							<option value="em-uso">Em Uso</option>
							<option value="sem-stock">Sem Stock</option>
						</select>
					</div>
				</section>

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{itensFiltrados.map((item) => {
						const emPosseDoUtilizador = requisicaoAtivaPorItem.has(item.id);
						const itemBloqueado = Boolean(itemBloqueadoPorOutraRequisicao.get(item.id));
						const estado = estadoDoItem(emPosseDoUtilizador, itemBloqueado);

						return (
							<article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
								<div className="mb-3 flex items-center justify-between">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 text-xs font-bold text-white">
										{item.visual}
									</div>
									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${
											estado === "Disponível"
												? "bg-green-100 text-green-700"
												: estado === "Em Uso"
													? "bg-amber-100 text-amber-700"
													: "bg-rose-100 text-rose-700"
										}`}
									>
										{estado}
									</span>
								</div>

								<h3 className="text-base font-semibold">{item.nome}</h3>
								<p className="mt-2 text-xs text-gray-500">Categoria: {item.categoria}</p>
								<p className="mt-1 text-xs text-gray-500">Estado: {estadoInternoItem(item.status)}</p>
								<p className="mt-1 text-xs text-gray-500">
									Origem: {item.adicionadoPorUtilizador ? "Adicionado por utilizador" : "Catálogo da escola"}
								</p>

								<div className="mt-4 grid gap-2">
									{emPosseDoUtilizador ? (
										<button
											onClick={() => devolverItem(item)}
											className="w-full rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
										>
											Devolver Item
										</button>
									) : (
										<button
											onClick={() => requisitarItem(item)}
											disabled={loadingSessao || itemBloqueado || itemEmAcao === item.id}
											className="w-full rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300 hover:enabled:bg-gray-600"
										>
											Requisitar Item
										</button>
									)}

									{item.adicionadoPorUtilizador && !emPosseDoUtilizador && (
										<button
											onClick={() => removerItem(item)}
										disabled={loadingSessao || itemEmAcao === item.id}
											className="w-full rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 hover:enabled:bg-rose-100"
										>
											Remover Item
										</button>
									)}
								</div>
							</article>
						);
					})}
				</section>
			</div>
		</div>
	);
}
