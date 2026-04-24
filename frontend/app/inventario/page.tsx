"use client";

import { FormEvent, useMemo, useState } from "react";

type ItemStatusFilter = "todos" | "disponivel" | "em-uso" | "sem-stock";

type InventoryItem = {
	id: number;
	nome: string;
	categoria: string;
	descricao: string;
	total: number;
	emUso: number;
	visual: string;
	adicionadoPorUtilizador: boolean;
};

const utilizadorAtual = "Joao Silva";

const itensIniciais: InventoryItem[] = [
	{
		id: 1,
		nome: "Sapatilhas de Ballet Bloch",
		categoria: "Vestuário e Calçado",
		descricao: "Sapatilhas de ballet em excelente estado.",
		total: 6,
		emUso: 4,
		visual: "SB",
		adicionadoPorUtilizador: false,
	},
	{
		id: 2,
		nome: "Collant de Dança",
		categoria: "Vestuário e Calçado",
		descricao: "Collant tamanho M com estojo.",
		total: 5,
		emUso: 2,
		visual: "CD",
		adicionadoPorUtilizador: false,
	},
	{
		id: 3,
		nome: "Manual de Ballet Clássico Vol. 1",
		categoria: "Material Didático",
		descricao: "Livro de técnicas para iniciantes.",
		total: 4,
		emUso: 1,
		visual: "MB",
		adicionadoPorUtilizador: false,
	},
	{
		id: 4,
		nome: "Arco de Ginástica Rítmica",
		categoria: "Equipamento de Ginástica",
		descricao: "Arco para treino técnico e coreografias.",
		total: 3,
		emUso: 1,
		visual: "AG",
		adicionadoPorUtilizador: false,
	},
	{
		id: 5,
		nome: "Microfone Shure SM58",
		categoria: "Equipamento Áudio",
		descricao: "Microfone dinâmico profissional para ensaios.",
		total: 2,
		emUso: 0,
		visual: "MS",
		adicionadoPorUtilizador: false,
	},
];

function estadoDoItem(item: InventoryItem, emPosseDoUtilizador: boolean) {
	if (emPosseDoUtilizador) return "Em Uso";
	if (item.total - item.emUso > 0) return "Disponível";
	return "Sem Stock";
}

export default function InventoryPage() {
	const [itens, setItens] = useState<InventoryItem[]>(itensIniciais);
	const [requisicoesUtilizador, setRequisicoesUtilizador] = useState<Record<number, string>>({
		2: "20/02/2026",
		3: "25/02/2026",
	});

	const [pesquisa, setPesquisa] = useState("");
	const [filtroCategoria, setFiltroCategoria] = useState("todas");
	const [filtroEstado, setFiltroEstado] = useState<ItemStatusFilter>("todos");

	const [novoNome, setNovoNome] = useState("");
	const [novaCategoria, setNovaCategoria] = useState("");
	const [novaDescricao, setNovaDescricao] = useState("");
	const [novaQuantidade, setNovaQuantidade] = useState("1");
	const [temaEscuroAtivo, setTemaEscuroAtivo] = useState(false);

	const categorias = useMemo(() => {
		const todas = itens.map((item) => item.categoria);
		return [...new Set(todas)].sort((a, b) => a.localeCompare(b));
	}, [itens]);

	const requisicoesAtivas = useMemo(() => {
		return itens.filter((item) => requisicoesUtilizador[item.id]);
	}, [itens, requisicoesUtilizador]);

	const itensFiltrados = useMemo(() => {
		return itens.filter((item) => {
			const emPosseDoUtilizador = Boolean(requisicoesUtilizador[item.id]);
			const estado = estadoDoItem(item, emPosseDoUtilizador);
			const textoOk = `${item.nome} ${item.descricao} ${item.categoria}`
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
	}, [itens, requisicoesUtilizador, pesquisa, filtroCategoria, filtroEstado]);

	function dataHojeFormatada() {
		return new Date().toLocaleDateString("pt-PT");
	}

	function requisitarItem(item: InventoryItem) {
		const disponiveis = item.total - item.emUso;
		if (disponiveis <= 0 || requisicoesUtilizador[item.id]) return;

		setItens((atual) =>
			atual.map((i) => (i.id === item.id ? { ...i, emUso: i.emUso + 1 } : i)),
		);

		setRequisicoesUtilizador((atual) => ({
			...atual,
			[item.id]: dataHojeFormatada(),
		}));
	}

	function devolverItem(item: InventoryItem) {
		if (!requisicoesUtilizador[item.id]) return;

		setItens((atual) =>
			atual.map((i) => (i.id === item.id ? { ...i, emUso: Math.max(0, i.emUso - 1) } : i)),
		);

		setRequisicoesUtilizador((atual) => {
			const copia = { ...atual };
			delete copia[item.id];
			return copia;
		});
	}

	function adicionarNovoItem(evento: FormEvent<HTMLFormElement>) {
		evento.preventDefault();

		const quantidade = Number(novaQuantidade);
		if (!novoNome.trim() || !novaCategoria.trim() || !novaDescricao.trim() || quantidade < 1) return;

		const novoItem: InventoryItem = {
			id: Date.now(),
			nome: novoNome.trim(),
			categoria: novaCategoria.trim(),
			descricao: novaDescricao.trim(),
			total: quantidade,
			emUso: 0,
			visual: novoNome
				.split(" ")
				.slice(0, 2)
				.map((p) => p[0]?.toUpperCase() ?? "")
				.join("")
				.slice(0, 2),
			adicionadoPorUtilizador: true,
		};

		setItens((atual) => [novoItem, ...atual]);
		setNovoNome("");
		setNovaCategoria("");
		setNovaDescricao("");
		setNovaQuantidade("1");
	}

	function removerItem(item: InventoryItem) {
		if (!item.adicionadoPorUtilizador) return;
		if (item.emUso > 0 || requisicoesUtilizador[item.id]) return;

		const confirmado = window.confirm(`Remover o item \"${item.nome}\" do inventário?`);
		if (!confirmado) return;

		setItens((atual) => atual.filter((i) => i.id !== item.id));
		setRequisicoesUtilizador((atual) => {
			if (!atual[item.id]) return atual;
			const copia = { ...atual };
			delete copia[item.id];
			return copia;
		});
	}

	return (
		<div
			className={`min-h-screen text-zinc-900 ${
				temaEscuroAtivo
					? "inventario-dark bg-[radial-gradient(circle_at_top_right,_#3b3f48_0%,_#2f3136_42%,_#232428_100%)]"
					: "bg-[radial-gradient(circle_at_top_right,_#f8d9a0_0%,_#f6ecd7_36%,_#f8f4ea_100%)]"
			}`}
		>
			<button
				type="button"
				onClick={() => setTemaEscuroAtivo((atual) => !atual)}
				aria-label="Alternar tema claro/escuro do inventário"
				title="Alternar tema do inventário"
				className="fixed right-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-400/40 bg-white/90 text-zinc-900 shadow-lg backdrop-blur transition hover:scale-[1.03] hover:bg-white"
			>
				{temaEscuroAtivo ? (
					<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
						<path
							d="M12 4.5a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 12.5a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1Zm7.5-6a1 1 0 0 1 1 1 1 1 0 0 1-1 1H18a1 1 0 1 1 0-2h1.5Zm-13.5 0a1 1 0 1 1 0 2H4.5a1 1 0 1 1 0-2H6Zm10.607-4.607a1 1 0 0 1 1.414 0l1.06 1.06a1 1 0 1 1-1.414 1.414l-1.06-1.06a1 1 0 0 1 0-1.414ZM5.919 17.02a1 1 0 0 1 1.414 0l1.06 1.06a1 1 0 1 1-1.414 1.414l-1.06-1.06a1 1 0 0 1 0-1.414Zm12.162 2.474a1 1 0 0 1-1.414 0l-1.06-1.06a1 1 0 1 1 1.414-1.414l1.06 1.06a1 1 0 0 1 0 1.414ZM7.393 7.393a1 1 0 0 1-1.414 0l-1.06-1.06A1 1 0 1 1 6.333 4.92l1.06 1.06a1 1 0 0 1 0 1.414ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
							fill="currentColor"
						/>
					</svg>
				) : (
					<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
						<path
							d="M14.5 3a1 1 0 0 1 .94 1.34 8 8 0 1 0 10.22 10.22 1 1 0 0 1 1.34.94A10 10 0 1 1 14.5 3Z"
							fill="currentColor"
						/>
					</svg>
				)}
			</button>
			<div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
				<header className="fade-in rounded-3xl border border-zinc-900/10 bg-white/80 p-5 shadow-[0_16px_40px_rgba(52,44,28,0.1)] backdrop-blur md:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Escola de Danca</p>
					<div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight md:text-5xl">Inventário</h1>
							<p className="mt-2 max-w-2xl text-sm text-zinc-600 md:text-base">
								Consulte, requisite e devolva itens para as aulas. Novos materiais podem ser adicionados
								pelos utilizadores quando a escola adquirir mais recursos.
							</p>
						</div>
						<div className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white">
							<p className="opacity-70">Utilizador atual</p>
							<p className="text-base font-semibold">{utilizadorAtual}</p>
						</div>
					</div>
				</header>

				<section className="mt-6 grid gap-4 md:grid-cols-[1.25fr_1fr]">
					<div className="fade-in rounded-3xl border border-orange-200 bg-orange-50 p-5 md:p-6">
						<h2 className="text-lg font-bold md:text-xl">Minhas Requisições Ativas</h2>
						<p className="mt-1 text-sm text-zinc-600">
							Tem <strong>{requisicoesAtivas.length}</strong> item(ns) em uso.
						</p>

						<div className="mt-4 space-y-3">
							{requisicoesAtivas.length === 0 && (
								<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600">
									Sem itens ativos no momento.
								</div>
							)}

							{requisicoesAtivas.map((item) => (
								<article key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="font-semibold">{item.nome}</h3>
											<p className="mt-1 text-xs text-zinc-500">Em uso desde: {requisicoesUtilizador[item.id]}</p>
										</div>
										<span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">Em Uso</span>
									</div>
								</article>
							))}
						</div>
					</div>

					<form
						onSubmit={adicionarNovoItem}
						className="fade-in rounded-3xl border border-zinc-900/10 bg-white p-5 shadow-sm md:p-6"
					>
						<h2 className="text-lg font-bold md:text-xl">Adicionar Novo Item</h2>
						<p className="mt-1 text-sm text-zinc-600">
							Itens adicionados aqui podem ser removidos se não estiverem em uso.
						</p>

						<div className="mt-4 space-y-3">
							<input
								value={novoNome}
								onChange={(e) => setNovoNome(e.target.value)}
								placeholder="Nome do item"
								className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
							/>
							<input
								value={novaCategoria}
								onChange={(e) => setNovaCategoria(e.target.value)}
								placeholder="Categoria (ex: Material Didático)"
								className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
							/>
							<textarea
								value={novaDescricao}
								onChange={(e) => setNovaDescricao(e.target.value)}
								placeholder="Descrição curta"
								rows={3}
								className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
							/>
							<input
								type="number"
								min={1}
								value={novaQuantidade}
								onChange={(e) => setNovaQuantidade(e.target.value)}
								className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
							/>
						</div>

						<button
							type="submit"
							className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
						>
							Guardar Item
						</button>
					</form>
				</section>

				<section className="fade-in mt-6 rounded-3xl border border-zinc-900/10 bg-white p-5 shadow-sm md:p-6">
					<h2 className="text-lg font-bold md:text-xl">Filtros</h2>
					<div className="mt-3 grid gap-3 md:grid-cols-3">
						<input
							value={pesquisa}
							onChange={(e) => setPesquisa(e.target.value)}
							placeholder="Pesquisar itens"
							className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
						/>

						<select
							value={filtroCategoria}
							onChange={(e) => setFiltroCategoria(e.target.value)}
							className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
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
							className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white"
						>
							<option value="todos">Todos os Estados</option>
							<option value="disponivel">Disponível</option>
							<option value="em-uso">Em Uso</option>
							<option value="sem-stock">Sem Stock</option>
						</select>
					</div>
				</section>

				<section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{itensFiltrados.map((item, indice) => {
						const emPosseDoUtilizador = Boolean(requisicoesUtilizador[item.id]);
						const estado = estadoDoItem(item, emPosseDoUtilizador);
						const disponiveis = item.total - item.emUso;

						return (
							<article
								key={item.id}
								style={{ animationDelay: `${indice * 0.06}s` }}
								className="stagger-up rounded-3xl border border-zinc-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
							>
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-bold tracking-wider text-white">
										{item.visual}
									</div>
									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${
											estado === "Disponível"
												? "bg-emerald-100 text-emerald-700"
												: estado === "Em Uso"
													? "bg-amber-100 text-amber-700"
													: "bg-rose-100 text-rose-700"
										}`}
									>
										{estado}
									</span>
								</div>

								<h3 className="text-base font-semibold">{item.nome}</h3>
								<p className="mt-2 text-sm text-zinc-600">{item.descricao}</p>
								<p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">{item.categoria}</p>
								<p className="mt-1 text-xs text-zinc-500">
									Origem: {item.adicionadoPorUtilizador ? "Adicionado por utilizador" : "Catálogo da escola"}
								</p>
								<p className="mt-1 text-xs text-zinc-500">
									Disponíveis: <strong>{Math.max(0, disponiveis)}</strong> / {item.total}
								</p>

								<div className="mt-4 grid gap-2">
									{emPosseDoUtilizador ? (
										<button
											onClick={() => devolverItem(item)}
											className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
										>
											Devolver Item
										</button>
									) : (
										<button
											onClick={() => requisitarItem(item)}
											disabled={disponiveis <= 0}
											className="w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
										>
											Requisitar Item
										</button>
									)}

									{item.adicionadoPorUtilizador && (
										<button
											onClick={() => removerItem(item)}
											disabled={item.emUso > 0 || Boolean(requisicoesUtilizador[item.id])}
											className="w-full rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
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
