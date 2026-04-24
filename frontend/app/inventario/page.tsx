"use client";

import Image from "next/image";
import Link from "next/link";
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
							<p className="text-sm text-gray-600">Utilizador atual: {utilizadorAtual}</p>
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
											<p className="mt-1 text-xs text-gray-500">Em uso desde: {requisicoesUtilizador[item.id]}</p>
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
							<textarea
								value={novaDescricao}
								onChange={(e) => setNovaDescricao(e.target.value)}
								placeholder="Descrição curta"
								rows={3}
								className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
							/>
							<input
								type="number"
								min={1}
								value={novaQuantidade}
								onChange={(e) => setNovaQuantidade(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
							/>
						</div>

						<button
							type="submit"
							className="mt-4 w-full rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
						>
							Guardar Item
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
						const emPosseDoUtilizador = Boolean(requisicoesUtilizador[item.id]);
						const estado = estadoDoItem(item, emPosseDoUtilizador);
						const disponiveis = item.total - item.emUso;

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
								<p className="mt-2 text-sm text-gray-600">{item.descricao}</p>
								<p className="mt-2 text-xs text-gray-500">Categoria: {item.categoria}</p>
								<p className="mt-1 text-xs text-gray-500">
									Disponíveis: <strong>{Math.max(0, disponiveis)}</strong> / {item.total}
								</p>
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
											disabled={disponiveis <= 0}
											className="w-full rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300 hover:enabled:bg-gray-600"
										>
											Requisitar Item
										</button>
									)}

									{item.adicionadoPorUtilizador && (
										<button
											onClick={() => removerItem(item)}
											disabled={item.emUso > 0 || Boolean(requisicoesUtilizador[item.id])}
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
