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

// Replaces the `any` that was used when finding the professor
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

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatTimeLabel(value: string) {
  return value?.slice(0, 5);
}

function estadoColor(status: string) {
  switch (status?.toLowerCase()) {
    case "confirmado":
      return "bg-emerald-100 text-emerald-700";
    case "pendente":
      return "bg-amber-100 text-amber-700";
    case "cancelado":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
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
    } catch {
      setUtilizadorAtual(null);
    } finally {
      setLoadingSessao(false);
    }
  }, [apiBase]);

  const carregarCoachings = useCallback(async (user: SessionUser) => {
    setErro("");
    setLoading(true);
    try {
      let url = "";

      if (user.id_user_type === 2) {
        const profRes = await fetch(`${apiBase}/professors`, { credentials: "include" });
        if (!profRes.ok) throw new Error("Falha ao carregar professores.");
        const profs = await profRes.json() as ApiProfessor[];
        const prof = profs.find((p) => p.id_user === user.id_user);
        if (!prof) {
          setCoachings([]);
          setErro("Professor não encontrado para esta conta.");
          return;
        }
        url = `${apiBase}/coachings/professor/${prof.id_professor}`;
      } else if (user.id_user_type === 3) {
        url = `${apiBase}/coachings/guardian/${user.id_user}`;
      } else {
        setCoachings([]);
        setErro("A conta de administração não tem acesso ao calendário.");
        return;
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao carregar coachings.");
      setCoachings(await res.json() as ApiCoaching[]);
    } catch {
      setErro("Não foi possível carregar os coachings.");
    } finally {
      setLoading(false);
    }
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
      return {
        iso,
        day: dateObj.getDate(),
        isCurrentMonth,
        events: coachingsPorData[iso] ?? [],
      };
    });
  }, [mesAtual, coachingsPorData]);

  const eventosSelecionados = dataSelecionada ? (coachingsPorData[dataSelecionada] ?? []) : [];
  const hojeIso = toIsoDate(new Date());

  const navegarMes = (offset: number) => {
    setMesAtual((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{
        background: "radial-gradient(circle at center, #ffffff 0%, #f7f3f9 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles — same as inventory */}
      <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(212,83,126,0.03)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -200, left: -200, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.06)", background: "rgba(212,83,126,0.02)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -150, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(212,83,126,0.08)", background: "rgba(127,119,221,0.03)", pointerEvents: "none", zIndex: 0 }} />

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap");
        :root {
          --font-display: "DM Serif Display", ui-serif, Georgia, serif;
          --font-body: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <div
        className="mx-auto w-full max-w-6xl px-6 pb-10 pt-8"
        style={{ fontFamily: "var(--font-body)", position: "relative", zIndex: 1 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Calendario</p>
            <h1 className="mt-2 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              Agenda de Coachings
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Visualiza os teus coachings por dia e encontra rapidamente detalhes de horario, modalidade e estudio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navegarMes(-1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300"
            >
              Mes anterior
            </button>
            <button
              onClick={() => navegarMes(1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300"
            >
              Proximo mes
            </button>
          </div>
        </div>

        {!loadingSessao && !utilizadorAtual && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow">
            Sessao nao encontrada. Inicia sessao em{" "}
            <Link href="/login" className="font-semibold underline">/login</Link>{" "}
            para veres o teu calendario.
          </div>
        )}

        {loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow">
            A carregar coachings...
          </div>
        )}

        {erro && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow">
            {erro}
          </div>
        )}

        {!loading && utilizadorAtual && !erro && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,_1.2fr)_minmax(0,_0.8fr)]">
            <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">{formatMonthTitle(mesAtual)}</h2>
                <div className="text-xs text-slate-500">{coachings.length} coaching(s)</div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-500">
                {weekDays.map((day) => (
                  <div key={day} className="text-center font-semibold uppercase tracking-[0.15em]">
                    {day}
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {diasCalendario.map((dia) => {
                  const isSelected = dia.iso === dataSelecionada;
                  const isToday = dia.iso === hojeIso;
                  return (
                    <button
                      key={dia.iso}
                      onClick={() => setDataSelecionada(dia.iso)}
                      className={`group flex min-h-[92px] flex-col rounded-2xl border p-2 text-left transition ${
                        dia.isCurrentMonth ? "border-slate-200 bg-white" : "border-transparent bg-slate-50/70 text-slate-400"
                      } ${
                        isSelected ? "border-slate-900 bg-slate-900 text-white" : "hover:border-slate-300"
                      } ${
                        isToday && !isSelected ? "border-amber-400" : ""
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {dia.day}
                      </span>
                      <div className="mt-2 space-y-1">
                        {dia.events.slice(0, 2).map((event) => (
                          <div
                            key={`${dia.iso}-${event.id_coaching}`}
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {event.modalidade}
                          </div>
                        ))}
                        {dia.events.length > 2 && (
                          <div className={`text-[11px] ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                            +{dia.events.length - 2} mais
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Detalhes do dia</h2>
                {dataSelecionada && (
                  <span className="text-xs text-slate-500">{formatDateLabel(dataSelecionada)}</span>
                )}
              </div>

              {eventosSelecionados.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Sem coachings para esta data.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {eventosSelecionados.map((coaching) => (
                    <div key={coaching.id_coaching} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800">{coaching.modalidade}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoColor(coaching.status)}`}>
                          {coaching.status}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-700">Horario:</span> {formatTimeLabel(coaching.start_time)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Duracao:</span> {coaching.duration_minutes} min
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Estudio:</span> {coaching.estudio}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Professor:</span> {coaching.professor}
                        </p>
                        {coaching.aluno && (
                          <p>
                            <span className="font-medium text-slate-700">Aluno:</span> {coaching.aluno}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-slate-700">Preco:</span> {coaching.price}€
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}