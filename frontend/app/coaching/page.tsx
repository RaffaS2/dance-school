"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiBase } from "../lib/apiBase";

// ── Types ─────────────────────────────────────────────────────────────────────
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

type Availability = {
	id_availability: number;
	id_professor: number;
	id_user: number;
	professor: string;
	date: string;
	start_time: string;
	end_time: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d: string) { return new Date(d).toLocaleDateString("pt-PT"); }
function podeCancelar(status: string) { return !status?.toLowerCase().includes("cancelado"); }
function initials(value: string) {
	return value.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2);
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
	amber:     "#C97A1A",
	amberLight:"rgba(201,122,26,0.10)",
	red:       "#D63B3B",
	redLight:  "rgba(214,59,59,0.10)",
};

const FONTS = {
	serif: "'Cormorant Garamond', serif",
	sans:  "'DM Sans', sans-serif",
};

const ITEMS_PER_PAGE = 6;

// ── Sub-components ────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
	const s = status?.toLowerCase();
	const map: Record<string, { bg: string; color: string }> = {
		confirmado: { bg: C.greenLight, color: C.green },
		pendente:   { bg: C.amberLight, color: C.amber },
		cancelado:  { bg: C.roseLight,  color: C.rose  },
	};
	const style = map[s] ?? { bg: "rgba(139,135,160,0.10)", color: C.muted };
	return (
		<span style={{
			display: "inline-flex", alignItems: "center", gap: 5,
			background: style.bg, color: style.color,
			padding: "3px 10px", borderRadius: 999,
			fontSize: 10, letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase",
		}}>
			<span style={{ width: 5, height: 5, borderRadius: "50%", background: style.color, flexShrink: 0 }} />
			{status}
		</span>
	);
}

function Avatar({ iv, color }: { iv: string; color?: string }) {
	return (
		<div style={{
			width: 40, height: 40, borderRadius: 12, flexShrink: 0,
			background: color ?? C.purpleGrad,
			display: "flex", alignItems: "center", justifyContent: "center",
			color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
			fontFamily: FONTS.sans,
		}}>{iv}</div>
	);
}

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, fontWeight: 600, minWidth: 60 }}>{label}</span>
			<span style={{ fontSize: 12, color: accent ?? C.inkMid, fontWeight: accent ? 600 : 400 }}>{value}</span>
		</div>
	);
}

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
	const totalPages = Math.ceil(total / perPage);
	if (totalPages <= 1) return null;
	const pages: (number | "...")[] = [];
	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
		else if (pages[pages.length - 1] !== "...") pages.push("...");
	}
	const btnBase: React.CSSProperties = {
		display: "inline-flex", alignItems: "center", justifyContent: "center",
		width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600,
		cursor: "pointer", transition: "all 0.15s", fontFamily: FONTS.sans, border: "none",
	};
	return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 36 }}>
			<button onClick={() => onChange(page - 1)} disabled={page === 1}
				style={{ ...btnBase, background: page === 1 ? C.surface : C.white, color: page === 1 ? C.muted : C.inkMid, border: `1.5px solid ${C.border}`, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}>
				<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
			</button>
			{pages.map((p, i) => p === "..." ? (
				<span key={`d${i}`} style={{ width: 36, textAlign: "center", color: C.muted, fontSize: 13 }}>···</span>
			) : (
				<button key={p} onClick={() => onChange(p as number)}
					style={{ ...btnBase, background: page === p ? C.purpleGrad : C.white, color: page === p ? "#fff" : C.inkMid, border: page === p ? "1.5px solid transparent" : `1.5px solid ${C.border}`, boxShadow: page === p ? "0 4px 12px rgba(30,19,48,0.2)" : "none" }}>
					{p}
				</button>
			))}
			<button onClick={() => onChange(page + 1)} disabled={page === totalPages}
				style={{ ...btnBase, background: page === totalPages ? C.surface : C.white, color: page === totalPages ? C.muted : C.inkMid, border: `1.5px solid ${C.border}`, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}>
				<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
			</button>
			<span style={{ marginLeft: 8, fontSize: 11, color: C.muted, fontFamily: FONTS.sans }}>
				{((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} de {total}
			</span>
		</div>
	);
}

// ── CoachingCard ──────────────────────────────────────────────────────────────
function CoachingCard({ c, cancelandoId, eliminandoId, onCancelar, onEliminar }: { c: ApiCoaching; cancelandoId: number | null; eliminandoId: number | null; onCancelar: (c: ApiCoaching) => void; onEliminar: (c: ApiCoaching) => void }) {
	const iv = initials(c.modalidade);
	const isLoadingCancel = cancelandoId === c.id_coaching;
	const isLoadingDelete = eliminandoId === c.id_coaching;
	const isCancelado = c.status?.toLowerCase() === "cancelado";
	return (
		<article
			style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.05)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}
			onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(28,24,40,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
			onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 20px rgba(28,24,40,0.05)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
		>
			<div style={{ height: 6, background: C.purpleGrad }} />
			<div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
				<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<Avatar iv={iv} />
						<div>
							<h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{c.modalidade}</h3>
							<p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{c.estudio}</p>
						</div>
					</div>
					<Badge status={c.status} />
				</div>
				<div style={{ height: 1, background: C.border, marginBottom: 14 }} />
				<div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
					<DetailRow label="Professor" value={c.professor} />
					{c.aluno && <DetailRow label="Aluno" value={c.aluno} accent={C.rose} />}
					<DetailRow label="Data" value={formatDate(c.date)} />
					<DetailRow label="Hora" value={c.start_time?.slice(0, 5)} />
					<DetailRow label="Duração" value={`${c.duration_minutes} min`} />
				</div>
				{podeCancelar(c.status) && (
					<button onClick={() => onCancelar(c)} disabled={isLoadingCancel}
						style={{ marginTop: 16, width: "100%", padding: "11px", borderRadius: 10, background: "transparent", border: `1.5px solid rgba(201,75,115,0.25)`, color: C.rose, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: isLoadingCancel ? "not-allowed" : "pointer", opacity: isLoadingCancel ? 0.5 : 1, fontFamily: FONTS.sans, transition: "all 0.15s" }}
						onMouseEnter={e => { if (!isLoadingCancel) (e.currentTarget as HTMLElement).style.background = C.roseSoft; }}
						onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
						{isLoadingCancel ? "A cancelar..." : "Cancelar Coaching"}
					</button>
				)}
				{isCancelado && (
					<button onClick={() => onEliminar(c)} disabled={isLoadingDelete}
						style={{ marginTop: 8, width: "100%", padding: "11px", borderRadius: 10, background: "transparent", border: `1.5px solid rgba(214,59,59,0.3)`, color: C.red, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: isLoadingDelete ? "not-allowed" : "pointer", opacity: isLoadingDelete ? 0.5 : 1, fontFamily: FONTS.sans, transition: "all 0.15s" }}
						onMouseEnter={e => { if (!isLoadingDelete) (e.currentTarget as HTMLElement).style.background = C.redLight; }}
						onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
						{isLoadingDelete ? "A eliminar..." : "Eliminar "}
					</button>
				)}
			</div>
		</article>
	);
}

// ── AvailabilityCard ──────────────────────────────────────────────────────────
function AvailabilityCard({ a, removendoId, onEliminar }: { a: Availability; removendoId: number | null; onEliminar: (a: Availability) => void }) {
	const isLoading = removendoId === a.id_availability;
	const diaSemana = new Date(a.date).toLocaleDateString("pt-PT", { weekday: "long" });
	const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

	return (
		<article
			style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.05)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}
			onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(28,24,40,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
			onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 20px rgba(28,24,40,0.05)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
		>
			{/* Topo colorido verde */}
			<div style={{ height: 6, background: C.purpleGrad }} />

			<div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
				{/* Header */}
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<Avatar iv="DI" />
						<div>
							<h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>{diaCapitalizado}</h3>
							<p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{formatDate(a.date)}</p>
						</div>
					</div>
					<span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(59,43,92,0.10)", color: "#3B2B5C", padding: "3px 10px", borderRadius: 999, fontSize: 10, letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase" }}>
						<span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3B2B5C", flexShrink: 0 }} />
						Livre
					</span>
				</div>

				<div style={{ height: 1, background: C.border, marginBottom: 14 }} />

				{/* Detalhes */}
				<div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
					<DetailRow label="Professor" value={a.professor} />
					<DetailRow label="Início" value={a.start_time?.slice(0, 5)} />
					<DetailRow label="Fim" value={a.end_time?.slice(0, 5)} />
					<DetailRow label="Duração" value={(() => {
						const [sh, sm] = a.start_time.split(":").map(Number);
						const [eh, em] = a.end_time.split(":").map(Number);
						const mins = (eh * 60 + em) - (sh * 60 + sm);
						return mins > 0 ? `${mins} min` : "—";
					})()} />
				</div>

				{/* Botão eliminar */}
				<button onClick={() => onEliminar(a)} disabled={isLoading}
					style={{ marginTop: 16, width: "100%", padding: "11px", borderRadius: 10, background: "transparent", border: `1.5px solid rgba(201,75,115,0.25)`, color: C.rose, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.5 : 1, fontFamily: FONTS.sans, transition: "all 0.15s" }}
					onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = C.roseSoft; }}
					onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
					{isLoading ? "A eliminar..." : "Eliminar Disponibilidade"}
				</button>
			</div>
		</article>
	);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CoachingPage() {
	const apiBase = getApiBase();
	const [activeTab, setActiveTab] = useState<"coachings" | "disponibilidades">("coachings");

	// ── Session ───────────────────────────────────────────────────────────
	const [utilizadorAtual, setUtilizadorAtual] = useState<SessionUser | null>(null);
	const [loadingSessao, setLoadingSessao] = useState(true);

	// ── Coachings state ───────────────────────────────────────────────────
	const [coachings, setCoachings] = useState<ApiCoaching[]>([]);
	const [loadingCoachings, setLoadingCoachings] = useState(true);
	const [erroCoachings, setErroCoachings] = useState("");
	const [cancelandoId, setCancelandoId] = useState<number | null>(null);
	const [eliminandoId, setEliminandoId] = useState<number | null>(null);
	const [pagina, setPagina] = useState(1);
	const [filtroPill, setFiltroPill] = useState<"todos" | "pendente" | "confirmado" | "cancelado">("todos");

	// ── Availabilities state ──────────────────────────────────────────────
	const [availabilities, setAvailabilities] = useState<Availability[]>([]);
	const [loadingAvail, setLoadingAvail] = useState(true);
	const [erroAvail, setErroAvail] = useState("");
	const [removendoId, setRemovendoId] = useState<number | null>(null);

	// ── Carregar sessão ───────────────────────────────────────────────────
	const carregarSessao = useCallback(async () => {
		setLoadingSessao(true);
		try {
			const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
			if (!res.ok) { setUtilizadorAtual(null); return; }
			const data = await res.json();
			setUtilizadorAtual(data.user);
		} catch { setUtilizadorAtual(null); }
		finally { setLoadingSessao(false); }
	}, [apiBase]);

	// ── Carregar coachings ────────────────────────────────────────────────
	const carregarCoachings = useCallback(async (user: SessionUser) => {
		setErroCoachings(""); setLoadingCoachings(true);
		try {
			let url = "";
			if (user.id_user_type === 2) {
				const profRes = await fetch(`${apiBase}/professors`, { credentials: "include" });
				if (!profRes.ok) throw new Error();
				const profs = await profRes.json();
				const prof = profs.find((p: any) => p.id_user === user.id_user);
				if (!prof) { setCoachings([]); return; }
				url = `${apiBase}/coachings/professor/${prof.id_professor}`;
			} else if (user.id_user_type === 1) {
				url = `${apiBase}/coachings`;
			} else {
				url = `${apiBase}/coachings/guardian/${user.id_user}`;
			}
			const res = await fetch(url, { credentials: "include" });
			if (!res.ok) throw new Error();
			setCoachings(await res.json());
			setPagina(1);
		} catch { setErroCoachings("Não foi possível carregar os coachings."); }
		finally { setLoadingCoachings(false); }
	}, [apiBase]);

	// ── Carregar disponibilidades ─────────────────────────────────────────
	const carregarAvailabilities = useCallback(async () => {
		setErroAvail(""); setLoadingAvail(true);
		try {
			const res = await fetch(`${apiBase}/availabilities`, { credentials: "include" });
			if (!res.ok) throw new Error();
			setAvailabilities(await res.json());
		} catch { setErroAvail("Não foi possível carregar as disponibilidades."); }
		finally { setLoadingAvail(false); }
	}, [apiBase]);

	// ── Cancelar coaching ─────────────────────────────────────────────────
	const cancelarCoaching = async (coaching: ApiCoaching) => {
		if (!window.confirm(`Cancelar o coaching de ${formatDate(coaching.date)} às ${coaching.start_time?.slice(0, 5)}?`)) return;
		setCancelandoId(coaching.id_coaching);
		setErroCoachings("");
		try {
			const detailRes = await fetch(`${apiBase}/coachings/${coaching.id_coaching}`, { credentials: "include" });
			if (!detailRes.ok) throw new Error("Não foi possível ler os dados do coaching.");
			const detail = await detailRes.json();
			const updateRes = await fetch(`${apiBase}/coachings/${coaching.id_coaching}`, {
				method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
				body: JSON.stringify({ ...detail, status: "cancelado" }),
			});
			if (!updateRes.ok) throw new Error("Não foi possível cancelar o coaching.");
			if (utilizadorAtual) await carregarCoachings(utilizadorAtual);
		} catch (err) { setErroCoachings(err instanceof Error ? err.message : "Erro ao cancelar."); }
		finally { setCancelandoId(null); }
	};

	// ── Eliminar coaching ─────────────────────────────────────────────────
	const eliminarCoaching = async (coaching: ApiCoaching) => {
		if (!window.confirm(`Tens a certeza que queres eliminar definitivamente o coaching de ${formatDate(coaching.date)} às ${coaching.start_time?.slice(0, 5)}? Esta ação não pode ser desfeita.`)) return;
		setEliminandoId(coaching.id_coaching);
		setErroCoachings("");
		try {
			const res = await fetch(`${apiBase}/coachings/${coaching.id_coaching}`, { method: "DELETE", credentials: "include" });
			if (!res.ok) throw new Error("Não foi possível eliminar o coaching.");
			if (utilizadorAtual) await carregarCoachings(utilizadorAtual);
		} catch (err) { setErroCoachings(err instanceof Error ? err.message : "Erro ao eliminar."); }
		finally { setEliminandoId(null); }
	};

	// ── Eliminar disponibilidade ──────────────────────────────────────────
	const eliminarAvailability = async (a: Availability) => {
		if (!window.confirm(`Eliminar disponibilidade de ${formatDate(a.date)} das ${a.start_time?.slice(0,5)} às ${a.end_time?.slice(0,5)}?`)) return;
		setRemovendoId(a.id_availability);
		setErroAvail("");
		try {
			const res = await fetch(`${apiBase}/availabilities/${a.id_availability}`, { method: "DELETE", credentials: "include" });
			if (!res.ok) throw new Error("Não foi possível eliminar.");
			await carregarAvailabilities();
		} catch (err) { setErroAvail(err instanceof Error ? err.message : "Erro ao eliminar."); }
		finally { setRemovendoId(null); }
	};

	// ── Effects ───────────────────────────────────────────────────────────
	useEffect(() => { void carregarSessao(); }, [carregarSessao]);
	useEffect(() => {
		if (!loadingSessao && utilizadorAtual) {
			void carregarCoachings(utilizadorAtual);
			void carregarAvailabilities();
		} else if (!loadingSessao && !utilizadorAtual) {
			setLoadingCoachings(false);
			setLoadingAvail(false);
		}
	}, [loadingSessao, utilizadorAtual, carregarCoachings, carregarAvailabilities]);
	useEffect(() => { setPagina(1); }, [filtroPill]);

	// ── Derived data ──────────────────────────────────────────────────────
	const counts = useMemo(() => ({
		todos: coachings.length,
		pendente: coachings.filter(c => c.status?.toLowerCase() === "pendente").length,
		confirmado: coachings.filter(c => c.status?.toLowerCase() === "confirmado").length,
		cancelado: coachings.filter(c => c.status?.toLowerCase() === "cancelado").length,
	}), [coachings]);

	const coachingsFiltrados = useMemo(() =>
		filtroPill === "todos" ? coachings : coachings.filter(c => c.status?.toLowerCase() === filtroPill),
		[coachings, filtroPill]
	);

	const coachingsPaginados = useMemo(() => {
		const start = (pagina - 1) * ITEMS_PER_PAGE;
		return coachingsFiltrados.slice(start, start + ITEMS_PER_PAGE);
	}, [coachingsFiltrados, pagina]);

	const availabilidadesFiltradas = useMemo(() => {
		if (!utilizadorAtual) return [];
		if (utilizadorAtual.id_user_type === 1) return availabilities;
		if (utilizadorAtual.id_user_type === 2) return availabilities.filter(a => a.id_user === utilizadorAtual.id_user);
		return [];
	}, [availabilities, utilizadorAtual]);

	const pills: { label: string; value: typeof filtroPill; count: number }[] = [
		{ label: "Todos", value: "todos", count: counts.todos },
		{ label: "Pendente", value: "pendente", count: counts.pendente },
		{ label: "Confirmado", value: "confirmado", count: counts.confirmado },
		{ label: "Cancelado", value: "cancelado", count: counts.cancelado },
	];

	const isProf = utilizadorAtual?.id_user_type === 2;

	// ── Render ────────────────────────────────────────────────────────────
	return (
		<div style={{ minHeight: "100vh", background: "radial-gradient(circle at center, #ffffff 0%, #f7f3f9 100%)", fontFamily: FONTS.sans, position: "relative", overflow: "hidden" }}>
			{/* Círculos decorativos */}
			<div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(212,83,126,0.03)", pointerEvents: "none", zIndex: 0 }} />
			<div style={{ position: "fixed", top: -200, left: -200, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.06)", background: "rgba(212,83,126,0.02)", pointerEvents: "none", zIndex: 0 }} />
			<div style={{ position: "fixed", bottom: -150, right: -150, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(127,119,221,0.03)", pointerEvents: "none", zIndex: 0 }} />

			<div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>

				{/* ── Page header ─────────────────────────────────────────── */}
				<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
					<div>
						<p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.rose, fontWeight: 600, marginBottom: 6 }}>As Minhas Aulas</p>
						<h1 style={{ fontFamily: FONTS.serif, fontSize: 42, fontWeight: 400, color: C.ink, lineHeight: 1, margin: 0 }}>Coachings</h1>
					</div>
					<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
						{/* Botão condicional por tab */}
						{activeTab === "coachings" ? (
							<Link href="/coaching/novo" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.purpleGrad, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 4px 16px rgba(30,19,48,0.25)" }}>
								<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
								Requisitar Coaching
							</Link>
						) : isProf ? (
							<Link href="/availabilities/novo" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.purpleGrad, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 4px 16px rgba(30,19,48,0.25)" }}>
								<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
								Marcar Disponibilidade
							</Link>
						) : null}
					</div>
				</div>

				{/* ── Session alert ────────────────────────────────────────── */}
				{!loadingSessao && !utilizadorAtual && (
					<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>
						Sessão não encontrada. <Link href="/login" style={{ fontWeight: 700, color: C.rose }}>Inicia sessão</Link> para continuar.
					</div>
				)}

				{/* ── Tabs ─────────────────────────────────────────────────── */}
				<div style={{ display: "flex", gap: 4, marginBottom: 24, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 6, width: "fit-content", boxShadow: "0 2px 12px rgba(28,24,40,0.04)" }}>
					{[
						{ key: "coachings", label: "Coachings", count: counts.todos, icon: "" },
						...(isProf ? [{ key: "disponibilidades", label: "Disponibilidades", count: availabilidadesFiltradas.length, icon: "" }] : []),
					].map(tab => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key as typeof activeTab)}
							style={{
								display: "inline-flex", alignItems: "center", gap: 8,
								padding: "9px 18px", borderRadius: 10, border: "none",
								fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
								cursor: "pointer", transition: "all 0.18s", fontFamily: FONTS.sans,
								background: activeTab === tab.key ? C.purpleGrad : "transparent",
								color: activeTab === tab.key ? "#fff" : C.muted,
								boxShadow: activeTab === tab.key ? "0 4px 12px rgba(30,19,48,0.2)" : "none",
							}}
						>
							<span>{tab.icon}</span>
							<span style={{ textTransform: "uppercase" }}>{tab.label}</span>
							<span style={{
								fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
								background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : C.border,
								color: activeTab === tab.key ? "#fff" : C.muted,
							}}>{tab.count}</span>
						</button>
					))}
				</div>

				{/* ══════════════════════════════════════════════════════════ */}
				{/* TAB: COACHINGS                                            */}
				{/* ══════════════════════════════════════════════════════════ */}
				{activeTab === "coachings" && (
					<>
						{loadingCoachings && (
							<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.white, border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
								<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
								A carregar coachings...
							</div>
						)}
						{erroCoachings && (
							<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>{erroCoachings}</div>
						)}
						{!loadingCoachings && utilizadorAtual && (
							<>
								{/* Filtros */}
								<div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.05)", padding: "20px 24px", marginBottom: 24 }}>
									<p style={{ margin: "0 0 12px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Filtrar por Estado</p>
									<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
										{pills.map(p => (
											<button key={p.value} onClick={() => setFiltroPill(p.value)}
												style={{ padding: "7px 16px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.18s", fontFamily: FONTS.sans, background: filtroPill === p.value ? C.purpleGrad : "transparent", color: filtroPill === p.value ? "#fff" : C.muted, border: filtroPill === p.value ? "1.5px solid transparent" : `1.5px solid ${C.border}`, display: "inline-flex", alignItems: "center", gap: 6 }}>
												{p.label} <span style={{ fontSize: 10, opacity: 0.8 }}>({p.count})</span>
											</button>
										))}
									</div>
								</div>

								<div style={{ marginBottom: 16 }}>
									<p style={{ margin: 0, fontSize: 12, color: C.muted }}>
										<strong style={{ color: C.ink }}>{coachingsFiltrados.length}</strong> {coachingsFiltrados.length === 1 ? "coaching encontrado" : "coachings encontrados"}
									</p>
								</div>

								{coachingsFiltrados.length === 0 ? (
									<div style={{ textAlign: "center", padding: "60px 20px" }}>
										<div style={{ fontSize: 48, marginBottom: 16, color: C.border }}>—</div>
										<p style={{ fontFamily: FONTS.serif, fontSize: 24, color: C.inkMid, margin: "0 0 8px" }}>Sem coachings</p>
										<p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Não foram encontrados coachings com este estado.</p>
									</div>
								) : (
									<>
										<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
											{coachingsPaginados.map(c => (
												<CoachingCard key={c.id_coaching} c={c} cancelandoId={cancelandoId} eliminandoId={eliminandoId} onCancelar={cancelarCoaching} onEliminar={eliminarCoaching} />
											))}
										</div>
										<Pagination page={pagina} total={coachingsFiltrados.length} perPage={ITEMS_PER_PAGE} onChange={setPagina} />
									</>
								)}
							</>
						)}
					</>
				)}

				{/* ══════════════════════════════════════════════════════════ */}
				{/* TAB: DISPONIBILIDADES                                     */}
				{/* ══════════════════════════════════════════════════════════ */}
				{activeTab === "disponibilidades" && (
					<>
						{loadingAvail && (
							<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.white, border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
								<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
								A carregar disponibilidades...
							</div>
						)}
						{erroAvail && (
							<div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>{erroAvail}</div>
						)}
						{!loadingAvail && utilizadorAtual && (
							<>
								<div style={{ marginBottom: 16 }}>
									<p style={{ margin: 0, fontSize: 12, color: C.muted }}>
										<strong style={{ color: C.ink }}>{availabilidadesFiltradas.length}</strong> {availabilidadesFiltradas.length === 1 ? "slot encontrado" : "slots encontrados"}
									</p>
								</div>

								{availabilidadesFiltradas.length === 0 ? (
									<div style={{ textAlign: "center", padding: "60px 20px" }}>
										<div style={{ fontSize: 48, marginBottom: 16, color: C.border }}>—</div>
										<p style={{ fontFamily: FONTS.serif, fontSize: 24, color: C.inkMid, margin: "0 0 8px" }}>Sem disponibilidades</p>
										<p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
											{isProf ? "Marca uma disponibilidade para aparecer aqui." : "Não existem disponibilidades registadas."}
										</p>
									</div>
								) : (
									<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
										{availabilidadesFiltradas.map(a => (
											<AvailabilityCard key={a.id_availability} a={a} removendoId={removendoId} onEliminar={eliminarAvailability} />
										))}
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>

			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
				@keyframes spin { to { transform: rotate(360deg); } }
				* { box-sizing: border-box; }
			`}</style>
		</div>
	);
}