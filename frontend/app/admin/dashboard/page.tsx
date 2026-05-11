"use client";

import { useEffect, useState, useCallback } from "react";
import { getApiBase } from "../../lib/apiBase";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Coaching {
  id: number;
  date?: string;
  scheduled_date?: string;
  start_time?: string;
  hora?: string;
  modality?: { name?: string; nome?: string };
  modality_name?: string;
  nome?: string;
  professor?: { name?: string; nome?: string };
}

interface Modality {
  id: number;
  name?: string;
  nome?: string;
}

interface DashboardState {
  loading: boolean;
  error: string | null;
  users: number;
  coachingsCount: number;
  professors: number;
  modalitiesCount: number;
  coachings: Coaching[];
  modalities: Modality[];
}

const INITIAL: DashboardState = {
  loading: true,
  error: null,
  users: 0,
  coachingsCount: 0,
  professors: 0,
  modalitiesCount: 0,
  coachings: [],
  modalities: [],
};

// ── Paleta & tokens ───────────────────────────────────────────────────────────
const C = {
  rose:       "#C94B73",
  roseSoft:   "rgba(201,75,115,0.06)",
  ink:        "#1C1828",
  inkMid:     "#3D3553",
  muted:      "#8B87A0",
  border:     "#EDE9F4",
  white:      "#FFFFFF",
  purpleGrad: "linear-gradient(135deg,#3B2B5C 0%,#1E1330 100%)",
  green:      "#1A9E5C",
  amber:      "#C97A1A",
};

const FONTS = {
  serif: "'Cormorant Garamond', serif",
  sans:  "'DM Sans', sans-serif",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
function toArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const v = raw as Record<string, unknown>;
  if (Array.isArray(v?.data)) return v.data as T[];
  return [];
}
function initials(name: string) {
  return name.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "AU";
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconUsers = () => (
  <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconCalendar = () => (
  <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconProf = () => (
  <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0122 21H2a12.083 12.083 0 013.84-10.422L12 14z" />
  </svg>
);
const IconTag = () => (
  <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 3h8l10 10a2 2 0 010 2.828l-5.172 5.172a2 2 0 01-2.828 0L3 11V3z" />
  </svg>
);
const IconRefresh = () => (
  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IconClock = () => (
  <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({
  label, value, accent, icon, loading, total,
}: {
  label: string; value: number; accent: string; icon: React.ReactNode;
  loading: boolean; total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.04)", overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s", position: "relative" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(28,24,40,0.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 20px rgba(28,24,40,0.04)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
    >
      {loading ? (
        <div style={{ padding: "22px 22px 20px" }}>
          <div style={{ height: 36, width: 36, borderRadius: 10, background: C.border, marginBottom: 16, animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: 38, width: 60, borderRadius: 8, background: C.border, marginBottom: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: 10, width: 80, borderRadius: 6, background: C.border, animation: "pulse 1.4s ease-in-out infinite" }} />
        </div>
      ) : (
        <>
          <div style={{ padding: "22px 22px 16px" }}>
            {/* Icon badge */}
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}15`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              {icon}
            </div>
            {/* Value */}
            <p style={{ fontFamily: FONTS.serif, fontSize: 48, fontWeight: 600, color: C.ink, lineHeight: 1, margin: 0 }}>
              {value}
            </p>
            {/* Label */}
            <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {label}
            </p>
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: C.border }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${accent}99, ${accent})`, borderRadius: 2, transition: "width 0.8s ease" }} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>(INITIAL);

  const fetchDashboard = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const [usersRaw, coachingsRaw, professorsRaw, modalitiesRaw] = await Promise.allSettled([
      apiFetch<unknown>("/users"),
      apiFetch<unknown>("/coachings"),
      apiFetch<unknown>("/professors"),
      apiFetch<unknown>("/modalities"),
    ]);
    const count = (r: PromiseSettledResult<unknown>) =>
      r.status === "fulfilled" ? toArray(r.value).length : 0;

    const coachingList: Coaching[] =
      coachingsRaw.status === "fulfilled"
        ? toArray<Coaching>(coachingsRaw.value)
            .filter(c => c.scheduled_date ?? c.date)
            .sort((a, b) =>
              new Date(a.scheduled_date ?? a.date ?? "").getTime() -
              new Date(b.scheduled_date ?? b.date ?? "").getTime()
            )
            .slice(0, 6)
        : [];

    const modalityList: Modality[] =
      modalitiesRaw.status === "fulfilled"
        ? toArray<Modality>(modalitiesRaw.value).slice(0, 8)
        : [];

    setState({
      loading: false, error: null,
      users: count(usersRaw),
      coachingsCount: count(coachingsRaw),
      professors: count(professorsRaw),
      modalitiesCount: count(modalitiesRaw),
      coachings: coachingList,
      modalities: modalityList,
    });
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const total = state.users + state.coachingsCount + state.professors + state.modalitiesCount;

  const statCards = [
    { label: "Utilizadores",   value: state.users,          accent: "#3b5bdb", icon: <IconUsers />    },
    { label: "Aulas Marcadas", value: state.coachingsCount, accent: C.green,   icon: <IconCalendar /> },
    { label: "Professores",    value: state.professors,     accent: "#7048e8", icon: <IconProf />     },
    { label: "Modalidades",    value: state.modalitiesCount,accent: C.amber,   icon: <IconTag />      },
  ];

  // Palette for modality pills
  const modalityColors = ["#3b5bdb","#7048e8","#C94B73","#1A9E5C","#C97A1A","#0c7abf","#b5330a","#3d7a5b"];

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 0%, #f3eef9 0%, #faf9fb 40%, #f7f3f0 100%)", fontFamily: FONTS.sans, position: "relative", overflow: "hidden" }}>

      {/* Decorative circles */}
      <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(212,83,126,0.03)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -200, left: -200, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.06)", background: "rgba(212,83,126,0.02)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -150, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(127,119,221,0.03)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.rose, fontWeight: 600, marginBottom: 6, margin: "0 0 6px" }}>
              Administração
            </p>
            <h1 style={{ fontFamily: FONTS.serif, fontSize: 42, fontWeight: 400, color: C.ink, lineHeight: 1, margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 12, color: C.muted, margin: "8px 0 0", fontWeight: 400 }}>
              {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.purpleGrad, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(30,19,48,0.25)", fontFamily: FONTS.sans, transition: "opacity 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            <IconRefresh /> Atualizar
          </button>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {state.error && (
          <div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 24, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>
            ⚠️ {state.error}
          </div>
        )}

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {statCards.map(card => (
            <StatCard key={card.label} loading={state.loading} total={total} {...card} />
          ))}
        </div>

        {/* ── Main content grid ─────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

          {/* ── Próximas Aulas ────────────────────────────────────────── */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.04)", overflow: "hidden" }}>
            {/* Card header */}
            <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, lineHeight: 1 }}>Próximas Aulas</h2>
                <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0", letterSpacing: "0.05em" }}>Aulas agendadas mais próximas</p>
              </div>
              <span style={{ fontSize: 10, letterSpacing: "0.12em", color: C.muted, background: C.border, borderRadius: 20, padding: "3px 12px", fontWeight: 700, textTransform: "uppercase" }}>
                {state.coachings.length} aulas
              </span>
            </div>

            {/* Table header */}
            {!state.loading && state.coachings.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "10px 24px", background: "rgba(237,233,244,0.3)" }}>
                {["Modalidade / Professor", "Data", "Hora"].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>{h}</span>
                ))}
              </div>
            )}

            {/* Rows */}
            <div>
              {state.loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "16px 24px", borderBottom: `1px solid rgba(237,233,244,0.7)`, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.border, flexShrink: 0, animation: "pulse 1.4s ease-in-out infinite" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <div style={{ height: 12, width: 110, borderRadius: 6, background: C.border, animation: "pulse 1.4s ease-in-out infinite" }} />
                        <div style={{ height: 10, width: 70, borderRadius: 6, background: C.border, animation: "pulse 1.4s ease-in-out infinite" }} />
                      </div>
                    </div>
                    <div style={{ height: 12, width: 70, borderRadius: 6, background: C.border, animation: "pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ height: 12, width: 40, borderRadius: 6, background: C.border, animation: "pulse 1.4s ease-in-out infinite" }} />
                  </div>
                ))
              ) : state.coachings.length > 0 ? (
                state.coachings.map((c, idx) => {
                  const name = c.modality?.name ?? c.modality?.nome ?? c.modality_name ?? c.nome ?? "Aula";
                  const professor = c.professor?.name ?? c.professor?.nome ?? null;
                  const rawDate = c.scheduled_date ?? c.date ?? null;
                  let dateStr = "—", timeStr = "";
                  if (rawDate) {
                    const d = new Date(rawDate);
                    dateStr = d.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short" });
                    timeStr = c.start_time ?? c.hora ?? d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
                  }
                  const avatarColors = ["#3b5bdb","#7048e8","#C94B73","#1A9E5C","#C97A1A"];
                  const ac = avatarColors[idx % avatarColors.length];
                  return (
                    <div
                      key={c.id}
                      style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "14px 24px", borderBottom: `1px solid rgba(237,233,244,0.7)`, alignItems: "center", transition: "background 0.15s", cursor: "default" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(237,233,244,0.25)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {/* Name + professor */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.purpleGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: "0.05em" }}>
                          {initials(name)}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.ink }}>{name}</p>
                          {professor && <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{professor}</p>}
                        </div>
                      </div>
                      {/* Date */}
                      <span style={{ fontSize: 12, color: C.inkMid, fontWeight: 500, textTransform: "capitalize", whiteSpace: "nowrap" }}>{dateStr}</span>
                      {/* Time */}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: C.muted, background: "rgba(237,233,244,0.6)", borderRadius: 8, padding: "4px 10px", whiteSpace: "nowrap" }}>
                        <IconClock /> {timeStr || "—"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ fontFamily: FONTS.serif, fontSize: 20, color: C.inkMid, margin: "0 0 4px" }}>Sem aulas agendadas</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Nenhuma aula encontrada</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ──────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Modalidades card */}
            <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.04)", overflow: "hidden", flex: 1 }}>
              <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, lineHeight: 1 }}>Modalidades</h2>
                <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0" }}>Todas as modalidades ativas</p>
              </div>

              <div style={{ padding: "14px 16px" }}>
                {state.loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ height: 40, borderRadius: 12, background: C.border, animation: "pulse 1.4s ease-in-out infinite" }} />
                    ))}
                  </div>
                ) : state.modalities.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {state.modalities.map((m, i) => {
                      const name = m.name ?? m.nome ?? "—";
                      const ac = modalityColors[i % modalityColors.length];
                      return (
                        <div
                          key={m.id}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, transition: "background 0.15s", cursor: "default" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(237,233,244,0.4)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {/* Color dot */}
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${ac}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: ac }}>{name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span style={{ fontSize: 13, color: C.inkMid, fontWeight: 500 }}>{name}</span>
                          {/* Subtle index */}
                          <span style={{ marginLeft: "auto", fontSize: 10, color: C.muted, background: C.border, borderRadius: 6, padding: "2px 7px", fontWeight: 600 }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ textAlign: "center", fontSize: 13, color: C.muted, padding: "32px 0", margin: 0 }}>Sem modalidades</p>
                )}
              </div>
            </div>

            {/* Quick-stats mini card */}
            {!state.loading && (
              <div style={{ background: C.purpleGrad, borderRadius: 20, padding: "22px 22px 20px", boxShadow: "0 4px 24px rgba(30,19,48,0.18)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: "0 0 14px", fontWeight: 600 }}>Resumo geral</p>
                {[
                  { label: "Rácio aulas/utilizador", value: state.users > 0 ? (state.coachingsCount / state.users).toFixed(1) : "—" },
                  { label: "Média aulas/professor",   value: state.professors > 0 ? (state.coachingsCount / state.professors).toFixed(1) : "—" },
                  { label: "Modalidades por professor", value: state.professors > 0 ? (state.modalitiesCount / state.professors).toFixed(1) : "—" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{row.label}</span>
                    <span style={{ fontFamily: FONTS.serif, fontSize: 20, fontWeight: 600, color: "#fff" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}