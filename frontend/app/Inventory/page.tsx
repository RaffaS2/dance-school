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
	},
	{
		id: 2,
		nome: "Collant de Dança",
		categoria: "Vestuário e Calçado",
		descricao: "Collant tamanho M com estojo.",
		total: 5,
		emUso: 2,
		visual: "CD",
	},
	{
		id: 3,
		nome: "Manual de Ballet Clássico Vol. 1",
		categoria: "Material Didático",
		descricao: "Livro de técnicas para iniciantes.",
		total: 4,
		emUso: 1,
		visual: "MB",
	},
	{
		id: 4,
		nome: "Arco de Ginástica Rítmica",
		categoria: "Equipamento de Ginástica",
		descricao: "Arco para treino técnico e coreografias.",
		total: 3,
		emUso: 1,
		visual: "AG",
	},
	{
		id: 5,
		nome: "Microfone Shure SM58",
		categoria: "Equipamento Áudio",
		descricao: "Microfone dinâmico profissional para ensaios.",
		total: 2,
		emUso: 0,
		visual: "MS",
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
		};

		setItens((atual) => [novoItem, ...atual]);
		setNovoNome("");
		setNovaCategoria("");
		setNovaDescricao("");
		setNovaQuantidade("1");
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f8d9a0_0%,_#f6ecd7_36%,_#f8f4ea_100%)] text-zinc-900 dark:bg-[radial-gradient(circle_at_top_right,_#3b3f48_0%,_#2f3136_42%,_#232428_100%)]">
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
						<p className="mt-1 text-sm text-zinc-600">Este registo simula o fluxo de criação por utilizadores.</p>

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
									Disponíveis: <strong>{Math.max(0, disponiveis)}</strong> / {item.total}
								</p>

								{emPosseDoUtilizador ? (
									<button
										onClick={() => devolverItem(item)}
										className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
									>
										Devolver Item
									</button>
								) : (
									<button
										onClick={() => requisitarItem(item)}
										disabled={disponiveis <= 0}
										className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
									>
										Requisitar Item
									</button>
								)}
							</article>
						);
					})}
				</section>
			</div>
		</div>
	);
}
