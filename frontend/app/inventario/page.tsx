"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiBase } from "../lib/apiBase";

type ItemStatusFilter = "disponivel" | "em-uso" | "indisponivel";

type ApiItem = {
	id_item: number;
	name: string;
	status: number;
	id_category: number;
	id_user?: number;
	user_id?: number;
	owner_id?: number;
	created_by?: number;
	id_utilizador?: number;
	image_url?: string;
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
	id_dono?: number;
	imagem_url?: string;
};

type SessionUser = {
	id_user: number;
	name: string;
	email: string;
	id_user_type: number;
};

function initials(value: string) {
	return value.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2);
}

function isActiveRequest(r: ApiItemRequest) { return !r.return_date; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("pt-PT"); }
function hojeISO() { return new Date().toISOString().split("T")[0]; }

function estadoDoItem(emPosse: boolean, bloqueado: boolean) {
	if (emPosse) return "Em Uso";
	if (bloqueado) return "Indisponível";
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
	} catch { return fallback; }
}

// ── Paleta & tokens ───────────────────────────────────────────────────────────
const C = {
	rose:      "#C94B73",
	roseLight: "rgba(201,75,115,0.10)",
	roseSoft:  "rgba(201,75,115,0.06)",
	ink:       "#1C1828",
	inkMid:    "#3D3553",
	muted:     "#8B87A0",
	border:    "#EDE9F4",
	surface:   "#FAFAF8",
	white:     "#FFFFFF",
	purpleGrad:"linear-gradient(135deg,#3B2B5C 0%,#1E1330 100%)",
	green:     "#1A9E5C",
	greenLight:"rgba(26,158,92,0.10)",
	red:       "#D63B3B",
	redLight:  "rgba(214,59,59,0.10)",
};

const FONTS = {
	serif: "'Cormorant Garamond', serif",
	sans:  "'DM Sans', sans-serif",
};

const ITEMS_PER_PAGE = 6;

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ estado }: { estado: string }) {
	const map: Record<string, { bg: string; color: string }> = {
		"Disponível":   { bg: C.greenLight, color: C.green },
		"Em Uso":       { bg: C.roseLight,  color: C.rose  },
		"Indisponível": { bg: C.redLight,   color: C.red   },
	};
	const s = map[estado] ?? { bg: "rgba(139,135,160,0.10)", color: C.muted };
	return (
		<span style={{
			display: "inline-flex", alignItems: "center", gap: 5,
			background: s.bg, color: s.color,
			padding: "3px 10px", borderRadius: 999,
			fontSize: 10, letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase",
		}}>
			<span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
			{estado}
		</span>
	);
}

function Avatar({ initials: iv }: { initials: string }) {
	return (
		<div style={{
			width: 36, height: 36, borderRadius: 10, flexShrink: 0,
			background: C.purpleGrad,
			display: "flex", alignItems: "center", justifyContent: "center",
			color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
			fontFamily: FONTS.sans,
		}}>{iv}</div>
	);
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			style={{
				padding: "6px 16px", borderRadius: 999, fontSize: 11,
				fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
				cursor: "pointer", transition: "all 0.18s",
				background: active ? C.purpleGrad : "transparent",
				color: active ? "#fff" : C.muted,
				border: active ? "1.5px solid transparent" : `1.5px solid ${C.border}`,
				fontFamily: FONTS.sans,
			}}
		>
			{label}
		</button>
	);
}

// ── Pagination component ──────────────────────────────────────────────────────

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
	const totalPages = Math.ceil(total / perPage);
	if (totalPages <= 1) return null;

	const pages: (number | "...")[] = [];
	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
			pages.push(i);
		} else if (pages[pages.length - 1] !== "...") {
			pages.push("...");
		}
	}

	const btnBase: React.CSSProperties = {
		display: "inline-flex", alignItems: "center", justifyContent: "center",
		width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600,
		cursor: "pointer", transition: "all 0.15s", fontFamily: FONTS.sans,
		border: "none",
	};

	return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 36 }}>
			{/* Prev */}
			<button
				onClick={() => onChange(page - 1)}
				disabled={page === 1}
				style={{
					...btnBase,
					background: page === 1 ? C.surface : C.white,
					color: page === 1 ? C.muted : C.inkMid,
					border: `1.5px solid ${C.border}`,
					opacity: page === 1 ? 0.5 : 1,
					cursor: page === 1 ? "not-allowed" : "pointer",
				}}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
			</button>

			{/* Page numbers */}
			{pages.map((p, i) =>
				p === "..." ? (
					<span key={`dots-${i}`} style={{ width: 36, textAlign: "center", color: C.muted, fontSize: 13 }}>···</span>
				) : (
					<button
						key={p}
						onClick={() => onChange(p as number)}
						style={{
							...btnBase,
							background: page === p ? C.purpleGrad : C.white,
							color: page === p ? "#fff" : C.inkMid,
							border: page === p ? "1.5px solid transparent" : `1.5px solid ${C.border}`,
							boxShadow: page === p ? "0 4px 12px rgba(30,19,48,0.2)" : "none",
						}}
					>
						{p}
					</button>
				)
			)}

			{/* Next */}
			<button
				onClick={() => onChange(page + 1)}
				disabled={page === totalPages}
				style={{
					...btnBase,
					background: page === totalPages ? C.surface : C.white,
					color: page === totalPages ? C.muted : C.inkMid,
					border: `1.5px solid ${C.border}`,
					opacity: page === totalPages ? 0.5 : 1,
					cursor: page === totalPages ? "not-allowed" : "pointer",
				}}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
				</svg>
			</button>

			{/* Info */}
			<span style={{ marginLeft: 8, fontSize: 11, color: C.muted, fontFamily: FONTS.sans }}>
				{((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} de {total}
			</span>
		</div>
	);
}

// ── ItemCard ──────────────────────────────────────────────────────────────────

type ItemCardProps = {
	item: InventoryItem;
	estado: string;
	emPosse: boolean;
	isDono: boolean;
	isAdmin: boolean;
	bloqueado: boolean;
	isLoading: boolean;
	limiteAtingido: boolean;
	onRequisitar: (item: InventoryItem) => void;
	onDevolver: (item: InventoryItem) => void;
	onRemover: (item: InventoryItem) => void;
	onAmpliada: (url: string) => void;
};

function ItemCard({ item, estado, emPosse, isDono, isAdmin, bloqueado, isLoading, limiteAtingido, onRequisitar, onDevolver, onRemover, onAmpliada }: ItemCardProps) {
	const podeRemover = isDono || isAdmin;

	return (
		<article
			style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.05)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}
			onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(28,24,40,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
			onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 20px rgba(28,24,40,0.05)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
		>
			{item.imagem_url ? (
				<div style={{ height: 160, overflow: "hidden", cursor: "zoom-in" }} onClick={() => onAmpliada(item.imagem_url!)}>
					<img src={item.imagem_url} alt={item.nome} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.35s" }}
						onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
						onMouseLeave={e => (e.currentTarget.style.transform = "none")}
					/>
				</div>
			) : (
				<div style={{ height: 80, background: "linear-gradient(135deg,#EDE9F4 0%, #F6F4F9 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<span style={{ fontFamily: FONTS.serif, fontSize: 32, color: C.border, userSelect: "none" }}>{item.visual}</span>
				</div>
			)}
			<div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
				<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
						<Avatar initials={item.visual} />
						<div>
							<h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{item.nome}</h3>
							<p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{item.categoria}</p>
						</div>
					</div>
					<Badge estado={estado} />
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
					<span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Registo</span>
					<span style={{ fontSize: 11, color: C.inkMid }}>{estadoInternoItem(item.status)}</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
					{emPosse ? (
						<button onClick={() => onDevolver(item)} disabled={isLoading} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: C.purpleGrad, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, fontFamily: FONTS.sans }}>
							{isLoading ? "A processar..." : "Devolver Item"}
						</button>
					) : podeRemover ? (
						<button disabled style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1.5px dashed ${C.border}`, background: "transparent", color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "not-allowed", fontFamily: FONTS.sans }}>
							Item gerido por si
						</button>
					) : bloqueado ? (
						<button disabled style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: C.border, color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "not-allowed", fontFamily: FONTS.sans }}>
							Indisponível
						</button>
					) : (
						<button onClick={() => onRequisitar(item)} disabled={limiteAtingido || isLoading} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: limiteAtingido ? C.border : C.purpleGrad, color: limiteAtingido ? C.muted : "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: (isLoading || limiteAtingido) ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, fontFamily: FONTS.sans }}>
							{isLoading ? "A processar..." : limiteAtingido ? "Limite atingido" : "Requisitar Item"}
						</button>
					)}
					{podeRemover && !emPosse && (
						<button onClick={() => onRemover(item)} disabled={isLoading}
							style={{ width: "100%", padding: "10px", borderRadius: 10, background: "transparent", border: `1.5px solid rgba(201,75,115,0.25)`, color: C.rose, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.5 : 1, fontFamily: FONTS.sans, transition: "all 0.15s" }}
							onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.roseSoft; }}
							onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
						>Remover</button>
					)}
				</div>
			</div>
		</article>
	);
}

// ── Section divider ───────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
			<div style={{ flex: 1, height: 1, background: C.border }} />
			<p style={{ margin: 0, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, fontWeight: 700, whiteSpace: "nowrap" }}>
				{label}
			</p>
			<div style={{ flex: 1, height: 1, background: C.border }} />
		</div>
	);
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InventoryPage() {
	const apiBase = getApiBase();
	const [utilizadorAtual, setUtilizadorAtual] = useState<SessionUser | null>(null);
	const [loadingSessao, setLoadingSessao] = useState(true);
	const [itens, setItens] = useState<InventoryItem[]>([]);
	const [requisicoes, setRequisicoes] = useState<ApiItemRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState("");
	const [itemEmAcao, setItemEmAcao] = useState<number | null>(null);
	const [pesquisa, setPesquisa] = useState("");
	const [filtroCategoria, setFiltroCategoria] = useState("todas");
	const [filtroEstado, setFiltroEstado] = useState<ItemStatusFilter>("disponivel");
	const [imagemAmpliada, setImagemAmpliada] = useState<string | null>(null);
	const isAdmin = utilizadorAtual?.id_user_type === 1;

	// ── Pagination state ─────────────────────────────────────────────────────
	const [paginaItens, setPaginaItens] = useState(1);
	const [paginaMeusItens, setPaginaMeusItens] = useState(1);

	const carregarSessao = useCallback(async () => {
		setLoadingSessao(true);
		try {
			const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
			if (!res.ok) { setUtilizadorAtual(null); return; }
			const data = (await res.json()) as { user: SessionUser };
			setUtilizadorAtual(data.user);
		} catch { setUtilizadorAtual(null); }
		finally { setLoadingSessao(false); }
	}, [apiBase]);

	const carregarDados = useCallback(async () => {
		setErro(""); setLoading(true);
		try {
			const [itemsRes, categoriesRes, requestsRes] = await Promise.all([
				fetch(`${apiBase}/items`, { cache: "no-store", credentials: "include" }),
				fetch(`${apiBase}/categories`, { cache: "no-store", credentials: "include" }),
				fetch(`${apiBase}/item-requests`, { cache: "no-store", credentials: "include" }),
			]);
			if (!itemsRes.ok || !categoriesRes.ok || !requestsRes.ok) throw new Error();
			const [itemsData, categoriesData, requestsData] = await Promise.all([
				itemsRes.json(), categoriesRes.json(), requestsRes.json(),
			]) as [ApiItem[], ApiCategory[], ApiItemRequest[]];
			const catById = new Map(categoriesData.map((c) => [c.id_category, c.name]));
			setRequisicoes(requestsData);
			setItens(itemsData.map((item) => ({
				id: item.id_item, nome: item.name,
				categoria: catById.get(item.id_category) ?? "Sem categoria",
				status: item.status, visual: initials(item.name),
				adicionadoPorUtilizador: true, id_dono: item.id_user, imagem_url: item.image_url,
			})));
		} catch { setErro("Não foi possível carregar o inventário."); }
		finally { setLoading(false); }
	}, [apiBase]);

	useEffect(() => { void carregarSessao(); }, [carregarSessao]);
	useEffect(() => { void carregarDados(); }, [carregarDados]);

	// Reset páginas quando filtros mudam
	useEffect(() => { setPaginaItens(1); }, [pesquisa, filtroCategoria, filtroEstado]);

	const categorias = useMemo(() => [...new Set(itens.map((i) => i.categoria))].sort((a, b) => a.localeCompare(b)), [itens]);
	const requisicoesAtivasGerais = useMemo(() => requisicoes.filter(isActiveRequest), [requisicoes]);
	const requisicoesAtivasDoUtilizador = useMemo(() => {
		if (!utilizadorAtual) return [];
		return requisicoesAtivasGerais.filter((r) => r.id_user === utilizadorAtual.id_user);
	}, [requisicoesAtivasGerais, utilizadorAtual]);
	const requisicaoAtivaPorItem = useMemo(() => {
		const map = new Map<number, ApiItemRequest>();
		for (const r of requisicoesAtivasDoUtilizador) map.set(r.id_item, r);
		return map;
	}, [requisicoesAtivasDoUtilizador]);
	const itemBloqueadoPorOutraRequisicao = useMemo(() => {
		const map = new Map<number, boolean>();
		if (!utilizadorAtual) return map;
		for (const r of requisicoesAtivasGerais) {
			if (r.id_user !== utilizadorAtual.id_user) map.set(r.id_item, true);
		}
		return map;
	}, [requisicoesAtivasGerais, utilizadorAtual]);
	const requisicoesAtivas = useMemo(() => itens.filter((i) => requisicaoAtivaPorItem.has(i.id)), [itens, requisicaoAtivaPorItem]);

	const meusItens = useMemo(() => {
		if (!utilizadorAtual) return [];
		return itens.filter(i => i.id_dono === utilizadorAtual.id_user);
	}, [itens, utilizadorAtual]);

	const itensFiltrados = useMemo(() => itens.filter((item) => {
		const isDono = utilizadorAtual !== null && item.id_dono === utilizadorAtual.id_user;
		if (isDono) return false;
		const emPosse = requisicaoAtivaPorItem.has(item.id);
		const bloqueado = Boolean(itemBloqueadoPorOutraRequisicao.get(item.id));
		const estado = estadoDoItem(emPosse, bloqueado);
		const textoOk = `${item.nome} ${item.categoria}`.toLowerCase().includes(pesquisa.toLowerCase());
		const catOk = filtroCategoria === "todas" || item.categoria === filtroCategoria;
		const estadoOk =
			(filtroEstado === "disponivel"   && estado === "Disponível") ||
			(filtroEstado === "em-uso"       && estado === "Em Uso") ||
			(filtroEstado === "indisponivel" && estado === "Indisponível");
		return textoOk && catOk && estadoOk;
	}), [itens, utilizadorAtual, requisicaoAtivaPorItem, itemBloqueadoPorOutraRequisicao, pesquisa, filtroCategoria, filtroEstado]);

	// ── Paginated slices ─────────────────────────────────────────────────────
	const meusItensPaginados = useMemo(() => {
		const start = (paginaMeusItens - 1) * ITEMS_PER_PAGE;
		return meusItens.slice(start, start + ITEMS_PER_PAGE);
	}, [meusItens, paginaMeusItens]);

	const itensPaginados = useMemo(() => {
		const start = (paginaItens - 1) * ITEMS_PER_PAGE;
		return itensFiltrados.slice(start, start + ITEMS_PER_PAGE);
	}, [itensFiltrados, paginaItens]);

	const LIMITE_REQUISICOES = 3;

	async function requisitarItem(item: InventoryItem) {
		if (!utilizadorAtual) { alert("Precisas de iniciar sessão para requisitar itens."); return; }
		if (item.id_dono === utilizadorAtual.id_user) { alert("Não podes requisitar um item que tu próprio adicionaste."); return; }
		if (requisicaoAtivaPorItem.has(item.id) || itemBloqueadoPorOutraRequisicao.get(item.id)) return;
		if (requisicoesAtivas.length >= LIMITE_REQUISICOES) { alert(`Atingiste o limite de ${LIMITE_REQUISICOES} requisições ativas.`); return; }
		setItemEmAcao(item.id);
		try {
			const res = await fetch(`${apiBase}/item-requests`, {
				method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
				body: JSON.stringify({ request_date: hojeISO(), return_date: null, id_item: item.id, id_user: utilizadorAtual.id_user, delivery_status: 1, request_status: 1 }),
			});
			if (!res.ok) throw new Error(await getApiErrorMessage(res, "Falha ao requisitar item"));
			await carregarDados();
		} catch (error) { alert(error instanceof Error ? error.message : "Não foi possível requisitar o item."); }
		finally { setItemEmAcao(null); }
	}

	async function devolverItem(item: InventoryItem) {
		const request = requisicaoAtivaPorItem.get(item.id);
		if (!request) return;
		setItemEmAcao(item.id);
		try {
			const res = await fetch(`${apiBase}/item-requests/${request.id_item_request}`, {
				method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
				body: JSON.stringify({ request_date: request.request_date, return_date: hojeISO(), id_item: request.id_item, id_user: request.id_user, delivery_status: request.delivery_status, request_status: request.request_status }),
			});
			if (!res.ok) throw new Error(await getApiErrorMessage(res, "Falha ao devolver item"));
			await carregarDados();
		} catch (error) { alert(error instanceof Error ? error.message : "Não foi possível devolver o item."); }
		finally { setItemEmAcao(null); }
	}

	async function removerItem(item: InventoryItem) {
		if (requisicaoAtivaPorItem.has(item.id)) { alert("Não é possível remover este item enquanto estiver em teu poder."); return; }
		if (!window.confirm(`Remover o item "${item.nome}" do inventário?`)) return;
		setItemEmAcao(item.id);
		try {
			const res = await fetch(`${apiBase}/items/${item.id}`, { method: "DELETE", credentials: "include" });
			if (!res.ok) throw new Error(await getApiErrorMessage(res, "Falha ao remover item"));
			await carregarDados();
		} catch (error) { alert(error instanceof Error ? error.message : "Não foi possível remover o item."); }
		finally { setItemEmAcao(null); }
	}

	const pillEstados: { label: string; value: ItemStatusFilter }[] = [
		{ label: "Disponível",    value: "disponivel"   },
		{ label: "Indisponível",  value: "indisponivel" },
	];

	const labelSecao: Record<ItemStatusFilter, string> = {
		"disponivel":   "✦ Disponíveis para Requisitar",
		"em-uso":       "↩ Em Uso por Mim",
		"indisponivel": "✕ Indisponíveis",
	};

	return (
		<div style={{ minHeight: "100vh", background: "radial-gradient(circle at center, #ffffff 0%, #f7f3f9 100%)", fontFamily: FONTS.sans, position: "relative", overflow: "hidden" }}>
			{/* Círculos decorativos */}
			<div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(212,83,126,0.03)", pointerEvents: "none", zIndex: 0 }} />
			<div style={{ position: "fixed", bottom: -150, right: -150, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(127,119,221,0.03)", pointerEvents: "none", zIndex: 0 }} />

			<div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>

				{/* Header */}
				<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
					<div>
						<p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.rose, fontWeight: 600, marginBottom: 6 }}>Gestão de Material</p>
						<h1 style={{ fontFamily: FONTS.serif, fontSize: 42, fontWeight: 400, color: C.ink, lineHeight: 1, margin: 0 }}>Inventário</h1>
					</div>
					<Link href="/inventario/novo" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.purpleGrad, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(30,19,48,0.25)" }}>
						<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
						</svg>
						Adicionar Item
					</Link>
				</div>

				{/* Alerts */}
				{!loadingSessao && !utilizadorAtual && (
					<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>
						Sessão não encontrada. <Link href="/login" style={{ fontWeight: 700, color: C.rose }}>Inicia sessão</Link> para veres as tuas requisições corretamente.
					</div>
				)}
				{loading && (
					<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.white, border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
						<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}>
							<path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
						</svg>
						A carregar inventário...
					</div>
				)}
				{erro && (
					<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>
						{erro}
					</div>
				)}

				{/* Top grid */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 24, alignItems: "start" }}>
					{/* Requisições ativas */}
					<div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.05)", overflow: "hidden" }}>
						<div style={{ padding: "20px 20px 0" }}>
							<p style={{ margin: "0 0 2px", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.rose, fontWeight: 600 }}>As Minhas</p>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
								<h2 style={{ fontFamily: FONTS.serif, fontSize: 22, fontWeight: 400, color: C.ink, margin: 0 }}>Requisições Ativas</h2>
								<span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONTS.sans, padding: "3px 10px", borderRadius: 999, background: requisicoesAtivas.length >= 3 ? C.roseLight : C.greenLight, color: requisicoesAtivas.length >= 3 ? C.rose : C.green }}>
									{requisicoesAtivas.length} / 3
								</span>
							</div>
						</div>
						<div style={{ padding: "0 20px 20px" }}>
							{requisicoesAtivas.length === 0 ? (
								<div style={{ borderRadius: 10, border: `1.5px dashed ${C.border}`, padding: "24px 16px", textAlign: "center" }}>
									<p style={{ margin: 0, fontSize: 12, color: C.muted }}>Nenhum item em teu poder.</p>
								</div>
							) : (
								<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
									{requisicoesAtivas.map((item) => (
										<div key={item.id} style={{ background: C.roseSoft, border: `1px solid rgba(201,75,115,0.15)`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
											<div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
												<Avatar initials={item.visual} />
												<div style={{ flex: 1, minWidth: 0 }}>
												<p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.nome}</p>
												<p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>
													Desde {formatDate(requisicaoAtivaPorItem.get(item.id)?.request_date ?? hojeISO())}
												</p>
											</div>
											</div>
											<div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
											<Badge estado="Em Uso" />
											<button onClick={() => devolverItem(item)} disabled={itemEmAcao === item.id} style={{ padding: "8px 12px", borderRadius: 999, border: `1px solid ${C.roseLight}`, background: C.white, color: C.rose, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: itemEmAcao === item.id ? "not-allowed" : "pointer", opacity: itemEmAcao === item.id ? 0.6 : 1, fontFamily: FONTS.sans }}>
												{itemEmAcao === item.id ? "A devolver..." : "Devolver"}
											</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Filtros */}
					<div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.05)", padding: "20px 24px" }}>
						<p style={{ margin: "0 0 2px", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Pesquisa</p>
						<h2 style={{ fontFamily: FONTS.serif, fontSize: 22, fontWeight: 400, color: C.ink, margin: "0 0 20px" }}>Filtros</h2>
						<div style={{ position: "relative", marginBottom: 16 }}>
							<svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} fill="none" viewBox="0 0 24 24" stroke={C.muted} strokeWidth={2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
								<circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
							</svg>
							<input value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Pesquisar por nome ou categoria..."
								style={{ width: "100%", boxSizing: "border-box", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: C.ink, outline: "none", fontFamily: FONTS.sans }}
								onFocus={e => (e.target.style.borderColor = C.rose)}
								onBlur={e => (e.target.style.borderColor = C.border)}
							/>
						</div>
						<div style={{ marginBottom: 16 }}>
							<p style={{ margin: "0 0 8px", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Categoria</p>
							<select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
								style={{ width: "100%", padding: "10px 14px", background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: C.ink, outline: "none", fontFamily: FONTS.sans, appearance: "none", cursor: "pointer" }}>
								<option value="todas">Todas as Categorias</option>
								{categorias.map((c) => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>
						<div>
							<p style={{ margin: "0 0 10px", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Estado</p>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
								{pillEstados.map(p => (
									<FilterPill key={p.value} label={p.label} active={filtroEstado === p.value} onClick={() => setFiltroEstado(p.value)} />
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Results count */}
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
					<p style={{ margin: 0, fontSize: 12, color: C.muted }}>
						<strong style={{ color: C.ink }}>{itensFiltrados.length}</strong> {itensFiltrados.length === 1 ? "item encontrado" : "itens encontrados"}
					</p>
					{(pesquisa || filtroCategoria !== "todas") && (
						<button onClick={() => { setPesquisa(""); setFiltroCategoria("todas"); }}
							style={{ background: "none", border: "none", fontSize: 11, color: C.rose, cursor: "pointer", fontWeight: 600, letterSpacing: "0.08em", fontFamily: FONTS.sans }}>
							Limpar filtros ×
						</button>
					)}
				</div>

				{/* Os Meus Itens */}
				{meusItens.length > 0 && (
					<div style={{ marginBottom: 32 }}>
						<SectionDivider label={`🗂 Os Meus Itens · ${meusItens.length}`} />
						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
							{meusItensPaginados.map((item) => {
								const emPosse = requisicaoAtivaPorItem.has(item.id);
								const bloqueado = Boolean(itemBloqueadoPorOutraRequisicao.get(item.id));
								const estado = estadoDoItem(emPosse, bloqueado);
								return <ItemCard key={item.id} item={item} estado={estado} emPosse={emPosse} isDono isAdmin={isAdmin} bloqueado={bloqueado} isLoading={itemEmAcao === item.id} limiteAtingido={requisicoesAtivas.length >= 3} onRequisitar={requisitarItem} onDevolver={devolverItem} onRemover={removerItem} onAmpliada={setImagemAmpliada} />;
							})}
						</div>
						<Pagination page={paginaMeusItens} total={meusItens.length} perPage={ITEMS_PER_PAGE} onChange={setPaginaMeusItens} />
					</div>
				)}

				{/* Secção filtrada */}
				<div style={{ marginBottom: 8 }}>
					<SectionDivider label={`${labelSecao[filtroEstado]} · ${itensFiltrados.length}`} />
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
					{itensPaginados.map((item) => {
						const emPosse = requisicaoAtivaPorItem.has(item.id);
						const bloqueado = Boolean(itemBloqueadoPorOutraRequisicao.get(item.id));
						const estado = estadoDoItem(emPosse, bloqueado);
						return (
								<ItemCard key={item.id} item={item} estado={estado} emPosse={emPosse} isDono={false} isAdmin={isAdmin} bloqueado={bloqueado} isLoading={itemEmAcao === item.id} limiteAtingido={requisicoesAtivas.length >= 3} onRequisitar={requisitarItem} onDevolver={devolverItem} onRemover={removerItem} onAmpliada={setImagemAmpliada} />
						);
					})}
					{!loading && itensFiltrados.length === 0 && (
						<div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
							<div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
							<p style={{ fontFamily: FONTS.serif, fontSize: 24, color: C.inkMid, margin: "0 0 8px" }}>Nenhum item encontrado</p>
							<p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Tenta ajustar os filtros ou adiciona um novo item.</p>
						</div>
					)}
				</div>

				{/* Paginação principal */}
				<Pagination page={paginaItens} total={itensFiltrados.length} perPage={ITEMS_PER_PAGE} onChange={setPaginaItens} />
			</div>

			{/* Modal imagem */}
			{imagemAmpliada && (
				<div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(28,24,40,0.75)", backdropFilter: "blur(4px)" }} onClick={() => setImagemAmpliada(null)}>
					<div style={{ position: "relative", maxHeight: "90vh", maxWidth: "90vw", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }} onClick={e => e.stopPropagation()}>
						<button onClick={() => setImagemAmpliada(null)} style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: "rgba(28,24,40,0.8)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: FONTS.sans }}>✕</button>
						<img src={imagemAmpliada} alt="Imagem ampliada" style={{ display: "block", maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain" }} />
					</div>
				</div>
			)}

			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
				@keyframes spin { to { transform: rotate(360deg); } }
				* { box-sizing: border-box; }
			`}</style>
		</div>
	);
}