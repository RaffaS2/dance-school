"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
};


type ApiProfessor = {
  id_professor: number;
  id_user: number;
};

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

function formatDateLabel(date: string) {
  return fromIsoDate(date).toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatTimeLabel(value: string) {
  return value?.slice(0, 5);
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ── Paleta ────────────────────────────────────────────────────────────────────
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
  green:     "#00A854",
  greenLight:"rgba(0,168,84,0.10)",
  amber:     "#FFB81C",
  amberLight:"rgba(255,184,28,0.12)",
  blue:      "#1A73E8",
  blueLight: "rgba(26,115,232,0.10)",
  red:       "#D63B3B",
  redLight:  "rgba(214,59,59,0.10)",
};

const FONTS = {
  serif: "'Cormorant Garamond', serif",
  sans:  "'DM Sans', sans-serif",
};

function estadoBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "confirmado" || s === "aprovado pelo professor") return { bg: "rgba(0,168,84,0.25)", color: "#008C3A" };
  if (s === "pendente")   return { bg: "rgba(255,184,28,0.18)", color: "#B8860B" };
  if (s === "cancelado")  return { bg: "rgba(214,59,59,0.18)", color: "#B62C2C" };
  return { bg: "rgba(139,135,160,0.10)", color: C.muted };

}

function getPrimaryDayTone(events: ApiCoaching[]) {
  const statuses = new Set(events.map((event) => event.status?.toLowerCase()));

  if (statuses.has("cancelado")) return { accent: C.red, soft: C.redLight };
  if (statuses.has("pendente")) return { accent: C.amber, soft: "rgba(255,184,28,0.12)" };
  if (statuses.has("confirmado") || statuses.has("aprovado pelo professor")) return { accent: "#00A854", soft: "rgba(0,168,84,0.12)" };
  return { accent: C.muted, soft: "rgba(139,135,160,0.08)" };
}

export default function CalendarioPage() {
  const apiBase = getApiBase();

  const [utilizadorAtual, setUtilizadorAtual] = useState<SessionUser | null>(null);
  const [loadingSessao, setLoadingSessao] = useState(true);
  const [coachings, setCoachings] = useState<ApiCoaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mesAtual, setMesAtual] = useState(() => new Date());
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);

  const carregarSessao = useCallback(async () => {
    setLoadingSessao(true);
    try {
      const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
      if (!res.ok) { setUtilizadorAtual(null); return; }
      const data = await res.json() as { user: SessionUser };
      setUtilizadorAtual(data.user);

    } catch { setUtilizadorAtual(null); }
    finally { setLoadingSessao(false); }
  }, [apiBase]);

  const carregarCoachings = useCallback(async (user: SessionUser) => {
    setErro(""); setLoading(true);
    try {
      let url = "";
      if (user.id_user_type === 2) {
        const profRes = await fetch(`${apiBase}/professors`, { credentials: "include" });
        if (!profRes.ok) throw new Error();
        const profs = await profRes.json() as ApiProfessor[];
        const prof = profs.find((p) => p.id_user === user.id_user);
        if (!prof) { setCoachings([]); return; }

        url = `${apiBase}/coachings/professor/${prof.id_professor}`;
      } else if (user.id_user_type === 3) {
        url = `${apiBase}/coachings/guardian/${user.id_user}`;
      } else {
        setCoachings([]); return;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error();
      setCoachings(await res.json() as ApiCoaching[]);
    } catch { setErro("Não foi possível carregar os coachings."); }
    finally { setLoading(false); }
  }, [apiBase]);

  useEffect(() => { void carregarSessao(); }, [carregarSessao]);
  useEffect(() => {
    if (!loadingSessao && utilizadorAtual) void carregarCoachings(utilizadorAtual);
    else if (!loadingSessao && !utilizadorAtual) setLoading(false);
  }, [loadingSessao, utilizadorAtual, carregarCoachings]);
  useEffect(() => {
    if (!dataSelecionada) setDataSelecionada(toIsoDate(new Date()));
  }, [dataSelecionada]);

  const coachingsPorData = useMemo(() => {
    return coachings.reduce((acc, coaching) => {
      const key = coaching.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(coaching);
      return acc;
    }, {} as Record<string, ApiCoaching[]>);
  }, [coachings]);

  const diasCalendario = useMemo(() => {
    const year = mesAtual.getFullYear();
    const month = mesAtual.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: 42 }, (_, idx) => {
      const dayNumber = idx - firstDayIndex + 1;
      let dateObj: Date;
      let isCurrentMonth = true;
      if (dayNumber <= 0) {
        dateObj = new Date(year, month - 1, daysInPrevMonth + dayNumber);
        isCurrentMonth = false;
      } else if (dayNumber > daysInMonth) {
        dateObj = new Date(year, month + 1, dayNumber - daysInMonth);
        isCurrentMonth = false;
      } else {
        dateObj = new Date(year, month, dayNumber);
      }
      const iso = toIsoDate(dateObj);
      return { iso, day: dateObj.getDate(), isCurrentMonth, events: coachingsPorData[iso] ?? [] };
    });
  }, [mesAtual, coachingsPorData]);

  const hojeIso = toIsoDate(new Date());
  const eventosSelecionados = useMemo(() => {
    if (!dataSelecionada) return [];
    return [...(coachingsPorData[dataSelecionada] ?? [])]
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [coachingsPorData, dataSelecionada]);

  const resumo = useMemo(() => {
    const monthCount = coachings
      .filter((item) => {
        const data = fromIsoDate(item.date);
        return data.getFullYear() === mesAtual.getFullYear() && data.getMonth() === mesAtual.getMonth();
      })
      .length;

    const dateRef = dataSelecionada ? fromIsoDate(dataSelecionada) : new Date();
    const weekStart = startOfWeek(dateRef);
    const weekEnd = endOfWeek(dateRef);

    const weekCount = coachings
      .filter((item) => {
        const data = fromIsoDate(item.date);
        return data >= weekStart && data <= weekEnd;
      })
      .length;

    return {
      monthCount,
      weekCount,
      selectedCount: eventosSelecionados.length,
    };
  }, [coachings, mesAtual, dataSelecionada, eventosSelecionados.length]);

  const navegarMes = (offset: number) => {
    setMesAtual((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const selecionarHoje = () => {
    const hoje = new Date();
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDataSelecionada(toIsoDate(hoje));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at center, #ffffff 0%, #f7f3f9 100%)",
      fontFamily: FONTS.sans,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Círculos decorativos */}
      <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(212,83,126,0.03)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -200, left: -200, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.06)", background: "rgba(212,83,126,0.02)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -150, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(127,119,221,0.03)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.rose, fontWeight: 600, marginBottom: 6 }}>Calendário</p>
            <h1 style={{ fontFamily: FONTS.serif, fontSize: 42, fontWeight: 400, color: C.ink, lineHeight: 1, margin: "0 0 10px" }}>
              Agenda de Coachings
            </h1>
            <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 480 }}>
              Visualiza os teus coachings por dia e encontra rapidamente detalhes de horário, modalidade e estúdio.
            </p>
          </div>
        </div>

        {!loading && utilizadorAtual && !erro && (
          <div className="calendar-summary" style={{ marginBottom: 20 }}>
            {[
              { label: "No mês", value: resumo.monthCount },
              { label: "Na semana", value: resumo.weekCount },
              { label: "No dia", value: resumo.selectedCount },
            ].map((item) => (
              <div key={item.label} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 14px", boxShadow: "0 2px 14px rgba(28,24,40,0.04)" }}>
                <p style={{ margin: 0, color: C.muted, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</p>
                <p style={{ margin: "4px 0 0", color: C.ink, fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Alerts ──────────────────────────────────────────────────────── */}
        {!loadingSessao && !utilizadorAtual && (
          <div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>
            Sessão não encontrada. <Link href="/login" style={{ fontWeight: 700, color: C.rose }}>Inicia sessão</Link>.
          </div>
        )}
        {loading && (
          <div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.white, border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
            A carregar coachings...
          </div>
        )}
        {erro && (
          <div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20, background: C.roseSoft, border: `1px solid rgba(201,75,115,0.2)`, color: C.rose, fontSize: 12 }}>{erro}</div>
        )}

        {/* ── Main grid ───────────────────────────────────────────────────── */}
        {!loading && utilizadorAtual && !erro && (
          <div className="calendar-layout" style={{ alignItems: "start" }}>

            {/* ── Calendar ──────────────────────────────────────────────── */}
            <section style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: "0 2px 20px rgba(28,24,40,0.05)", padding: 20 }}>
              {/* Month header */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button
                  onClick={() => navegarMes(-1)}
                  style={{ width: 42, height: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: `1.5px solid ${C.border}`, background: C.white, color: C.inkMid, cursor: "pointer", fontFamily: FONTS.sans, transition: "all 0.15s", boxShadow: "0 2px 8px rgba(28,24,40,0.04)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.rose}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
                  aria-label="Mês anterior"
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span>
                </button>

                <div style={{ textAlign: "center" }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.ink, textTransform: "capitalize" }}>{formatMonthTitle(mesAtual)}</h2>
                  <span style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: C.muted, fontWeight: 600 }}>{resumo.monthCount} coaching(s)</span>
                </div>

                <button
                  onClick={() => navegarMes(1)}
                  style={{ width: 42, height: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: `1.5px solid ${C.border}`, background: C.white, color: C.inkMid, cursor: "pointer", fontFamily: FONTS.sans, transition: "all 0.15s", boxShadow: "0 2px 8px rgba(28,24,40,0.04)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.rose}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
                  aria-label="Próximo mês"
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>›</span>
                </button>
              </div>


              {/* Week day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
                {weekDays.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, paddingBottom: 6 }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {diasCalendario.map((dia) => {
                  const isSelected = dia.iso === dataSelecionada;
                  const isToday = dia.iso === hojeIso;
                  const hasEvents = dia.events.length > 0;
                  const dayTone = hasEvents ? getPrimaryDayTone(dia.events) : null;

                  return (
                    <button
                      key={dia.iso}
                      onClick={() => setDataSelecionada(dia.iso)}
                      style={{
                        minHeight: 80,
                        borderRadius: 12,
                        padding: "8px 6px",
                        border: isSelected
                          ? "1.5px solid transparent"
                          : isToday
                          ? `1.5px solid ${C.blue}`
                          : `1.5px solid ${dia.isCurrentMonth && !hasEvents ? C.border : "transparent"}`,
                        background: isSelected
                          ? C.purpleGrad
                          : dia.isCurrentMonth ? C.white : C.surface,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        opacity: dia.isCurrentMonth ? 1 : 0.45,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "#fff" : isToday ? C.blue : hasEvents ? (dayTone?.accent ?? C.ink) : C.ink }}>
                        {dia.day}
                      </span>
                      {hasEvents && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: isSelected ? "#fff" : (dayTone?.accent ?? C.muted) }} />
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {dia.events.slice(0, 2).map(ev => (
                          (() => {
                            const badge = estadoBadge(ev.status);
                            return (
                          <div key={ev.id_coaching} style={{
                            borderRadius: 4,
                            padding: "2px 5px",
                            fontSize: 9,
                            fontWeight: 600,
                            background: isSelected ? "rgba(255,255,255,0.18)" : badge.bg,
                            color: isSelected ? "#fff" : badge.color,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {ev.modalidade}
                          </div>
                            );
                          })()
                        ))}
                        {dia.events.length > 2 && (
                          <span style={{ fontSize: 9, color: isSelected ? "rgba(255,255,255,0.7)" : C.muted }}>
                            +{dia.events.length - 2} mais
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Detail panel ──────────────────────────────────────────── */}
            {/* minHeight ensures the panel never collapses and causes layout shifts */}
            <aside style={{
              background: C.white,
              borderRadius: 20,
              border: `1px solid ${C.border}`,
              boxShadow: "0 2px 20px rgba(28,24,40,0.05)",
              padding: 20,
              minHeight: 520,
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 16,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.ink }}>Detalhes do dia</h2>
                {dataSelecionada && (
                  <span style={{ fontSize: 11, color: C.muted, textAlign: "right", lineHeight: 1.4 }}>
                    {formatDateLabel(dataSelecionada)}
                  </span>
                )}
              </div>

              {eventosSelecionados.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", padding: "24px 16px", borderRadius: 12, border: `1.5px dashed ${C.border}`, width: "100%" }}>
                    <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Sem coachings para esta data.</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
                  {eventosSelecionados.map((coaching) => {
                    const badge = estadoBadge(coaching.status);
                    return (
                      <div key={coaching.id_coaching} style={{
                        background: C.surface, borderRadius: 14,
                        border: `1px solid ${C.border}`, padding: "14px 16px",
                      }}>
                        {/* Card header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.ink }}>{coaching.modalidade}</p>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            background: badge.bg, color: badge.color,
                            padding: "3px 10px", borderRadius: 999,
                            fontSize: 10, letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase",
                          }}>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: badge.color }} />
                            {coaching.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {[
                            { label: "Horário", value: formatTimeLabel(coaching.start_time) },
                            { label: "Duração", value: `${coaching.duration_minutes} min` },
                            { label: "Estúdio", value: coaching.estudio },
                            { label: "Professor", value: coaching.professor },
                            ...(coaching.aluno ? [{ label: "Aluno", value: coaching.aluno }] : []),
                          ].map(row => (
                            <div key={row.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, fontWeight: 600, minWidth: 64 }}>{row.label}</span>
                              <span style={{ fontSize: 12, color: C.inkMid }}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }

        .calendar-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
          gap: 20px;
        }

        .calendar-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 1024px) {
          .calendar-layout {
            grid-template-columns: 1fr;
          }

          .calendar-layout aside {
            position: static !important;
            min-height: 360px !important;
          }
        }

        @media (max-width: 640px) {
          .calendar-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}