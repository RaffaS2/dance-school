"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getApiBase } from "./lib/apiBase";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionUser = {
  id_user: number;
  name: string;
  email: string;
  id_user_type: number;
};

type Aula = {
  id: number;
  hora: string;          // "09:00"
  duracao: number;       // minutos
  modalidade: string;    // "Ballet"
  sala: string;          // "Sala A"
  professor: string;
  vagas: number | null;  // null = esgotado
};

type Professor = {
  id: number;
  nome: string;
  modalidade: string;
  hora: string;          // próxima disponibilidade
  disponivel: boolean;
};

type Notificacao = {
  id: number;
  tipo: "inventario" | "aula" | "workshop" | "outro";
  titulo: string;
  subtitulo: string;
  prazo?: string;
  urgente?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isProfessorOrAdmin(userType: number) {
  return userType !== 3;
}

const MOD_COLORS: Record<string, { text: string; bg: string; bar: string }> = {
  Ballet:        { text: "text-pink-400",   bg: "bg-pink-400/15",    bar: "#f472b6" },
  Contemporânea: { text: "text-blue-400",   bg: "bg-blue-400/15",    bar: "#60a5fa" },
  Jazz:          { text: "text-yellow-400", bg: "bg-yellow-400/15",  bar: "#fbbf24" },
  "Hip Hop":     { text: "text-green-400",  bg: "bg-green-400/15",   bar: "#4ade80" },
  Flamenco:      { text: "text-orange-400", bg: "bg-orange-400/15",  bar: "#fb923c" },
  Coaching:      { text: "text-purple-400", bg: "bg-purple-400/15",  bar: "#c084fc" },
};

const MOD_DOT: Record<string, string> = {
  Ballet:        "#f472b6",
  Contemporânea: "#60a5fa",
  Jazz:          "#fbbf24",
  "Hip Hop":     "#4ade80",
  Flamenco:      "#fb923c",
  Coaching:      "#c084fc",
};

const PROF_AVATAR_GRADIENT: Record<string, string> = {
  Ballet:        "from-purple-600 to-purple-400",
  Contemporânea: "from-blue-700 to-blue-400",
  Jazz:          "from-yellow-700 to-yellow-400",
  "Hip Hop":     "from-green-700 to-green-400",
  Flamenco:      "from-orange-700 to-orange-400",
  Coaching:      "from-violet-600 to-violet-400",
};

function vagasBadge(vagas: number | null) {
  if (vagas === null || vagas === 0)
    return <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 whitespace-nowrap">Esgotado</span>;
  if (vagas <= 2)
    return <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 whitespace-nowrap">{vagas} vagas</span>;
  return <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 whitespace-nowrap">{vagas} vagas</span>;
}

function notifIcon(tipo: Notificacao["tipo"]) {
  const map: Record<string, { emoji: string; bg: string }> = {
    inventario: { emoji: "📦", bg: "bg-orange-400/15" },
    aula:       { emoji: "✅", bg: "bg-green-400/12" },
    workshop:   { emoji: "🔔", bg: "bg-purple-400/12" },
    outro:      { emoji: "ℹ️",  bg: "bg-gray-200" },
  };
  return map[tipo] ?? map.outro;
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const apiBase = getApiBase();

  const [utilizador, setUtilizador]       = useState<SessionUser | null>(null);
  const [isProfessor, setIsProfessor]     = useState(false);
  const [loadingSessao, setLoadingSessao] = useState(true);

  const [aulas, setAulas]                 = useState<Aula[]>([]);
  const [loadingAulas, setLoadingAulas]   = useState(true);

  const [professores, setProfessores]     = useState<Professor[]>([]);
  const [loadingProfs, setLoadingProfs]   = useState(true);

  const [notifs, setNotifs]               = useState<Notificacao[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // ── Session ────────────────────────────────────────────────────────────────

  const carregarSessao = useCallback(async () => {
    setLoadingSessao(true);
    try {
      const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
      if (!res.ok) { setUtilizador(null); return; }
      const data = (await res.json()) as { user: SessionUser };
      setUtilizador(data.user);
      setIsProfessor(isProfessorOrAdmin(data.user.id_user_type));
    } catch {
      setUtilizador(null);
    } finally {
      setLoadingSessao(false);
    }
  }, [apiBase]);

  // ── Agenda ─────────────────────────────────────────────────────────────────

  const carregarAulas = useCallback(async () => {
    setLoadingAulas(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`${apiBase}/aulas?data=${today}`, { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as Aula[];
      setAulas(data);
    } catch {
      setAulas([]);
    } finally {
      setLoadingAulas(false);
    }
  }, [apiBase]);

  // ── Professores ────────────────────────────────────────────────────────────

  const carregarProfessores = useCallback(async () => {
    setLoadingProfs(true);
    try {
      const res = await fetch(`${apiBase}/professores/disponibilidades/hoje`, { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as Professor[];
      setProfessores(data);
    } catch {
      setProfessores([]);
    } finally {
      setLoadingProfs(false);
    }
  }, [apiBase]);

  // ── Notificações ───────────────────────────────────────────────────────────

  const carregarNotificacoes = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch(`${apiBase}/notificacoes`, { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as Notificacao[];
      setNotifs(data);
    } catch {
      setNotifs([]);
    } finally {
      setLoadingNotifs(false);
    }
  }, [apiBase]);

  const dispensarNotif = (id: number) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => { void carregarSessao(); }, [carregarSessao]);

  useEffect(() => {
    void carregarAulas();
    void carregarProfessores();
    void carregarNotificacoes();
  }, [carregarAulas, carregarProfessores, carregarNotificacoes]);

  // ── Date label ─────────────────────────────────────────────────────────────

  const dataHoje = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
  const dataCapital = dataHoje.charAt(0).toUpperCase() + dataHoje.slice(1);

  // ── Render ─────────────────────────────────────────────────────────────────

  const MODALIDADES = ["Ballet", "Contemporânea", "Jazz", "Hip Hop", "Flamenco", "Coaching"];

  return (
    <div
      className="min-h-screen flex flex-col"
    style={{ background: "#ffffff", color: "#1a1714", fontFamily: "'Outfit', sans-serif" }}
    >

      {/* ── PAGE GRID ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT */}
        <div className="flex-1 flex flex-col gap-7 p-8 overflow-y-auto border-r border-gray-200">

          {/* HEADER */}
          <div>
            <p className="text-[12px] tracking-wide text-gray-400 mb-1">{dataCapital}</p>
            {loadingSessao ? (
              <Skeleton className="h-9 w-64 mb-2" />
            ) : (
              <h1 className="text-[32px] font-light leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Bem-vinda,{" "}
                <em className="not-italic font-normal" style={{ color: "#f5a623" }}>
                  {utilizador?.name ?? "utilizador"}
                </em>
              </h1>
            )}
            <p className="text-[13px] text-gray-400 mt-1">
              {loadingAulas ? "A carregar agenda…" : `Tem ${aulas.length} aula${aulas.length !== 1 ? "s" : ""} programada${aulas.length !== 1 ? "s" : ""} para hoje.`}
            </p>
          </div>

          {/* AGENDA */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden" style={{ background: "#f9f9f9" }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
              <span className="font-semibold text-sm">Agenda de Hoje</span>
              <span className="text-[11px] text-gray-400 bg-gray-400/7 px-3 py-1 rounded-full">{aulas.length} aulas</span>
            </div>

            {loadingAulas ? (
              <div className="flex flex-col gap-3 p-5">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : aulas.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">Sem aulas hoje.</p>
            ) : (
              aulas.map((aula) => {
                const mod = MOD_COLORS[aula.modalidade] ?? MOD_COLORS.Coaching;
                return (
                  <div
                    key={aula.id}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 hover:bg-gray-200/3 transition-colors cursor-pointer last:border-b-0"
                  >
                    <div className="w-[3px] self-stretch rounded-full flex-shrink-0" style={{ background: mod.bar }} />
                    <div className="min-w-[52px]">
                      <div className="text-[13px] font-semibold">{aula.hora}</div>
                      <div className="text-[11px] text-gray-400">{aula.duracao}min</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${mod.text} ${mod.bg}`}>
                          {aula.modalidade}
                        </span>
                        <span className="text-[11px] text-gray-400">{aula.sala}</span>
                      </div>
                      <div className="text-[13px] text-gray-400">{aula.professor}</div>
                    </div>
                    {vagasBadge(aula.vagas)}
                  </div>
                );
              })
            )}
          </div>

          {/* PROFESSORES */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden" style={{ background: "#ffffff" }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
              <span className="font-semibold text-sm">Disponibilidade dos Professores</span>
            </div>

            {loadingProfs ? (
              <div className="grid grid-cols-2 gap-3 p-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : professores.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">Sem dados de disponibilidade.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 p-4">
                {professores.map((p) => {
                  const gradClass = PROF_AVATAR_GRADIENT[p.modalidade] ?? "from-violet-600 to-violet-400";
                  const dotColor  = p.disponivel ? "#4ade80" : "#f87171";
                  const mod       = MOD_COLORS[p.modalidade] ?? MOD_COLORS.Coaching;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-200/3 transition-all cursor-pointer"
                      style={{ background: "#f9f9f9" }}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-gray-400 flex-shrink-0 bg-gradient-to-br ${gradClass}`}>
                        {p.nome.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate">{p.nome}</div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block mt-1 ${mod.text} ${mod.bg}`}>
                          {p.modalidade}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="w-2 h-2 rounded-full ml-auto mb-1" style={{ background: dotColor }} />
                        <div className="text-[12px] font-semibold text-gray-700">{p.hora}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-t border-gray-200">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 mr-1">Modalidades</span>
              {MODALIDADES.map((m) => (
                <span key={m} className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 bg-gray-400/5 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: MOD_DOT[m] ?? "#888" }} />
                  {m}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-80 flex flex-col gap-5 p-6 overflow-y-auto" style={{ background: "rgba(0,0,0,0.15)" }}>

          {/* NOTIFICAÇÕES */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden" style={{ background: "#ffffff" }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
              <span className="font-semibold text-sm">Notificações</span>
              {notifs.length > 0 && (
                <span className="w-[18px] h-[18px] bg-red-400 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                  {notifs.length}
                </span>
              )}
            </div>

            {loadingNotifs ? (
              <div className="flex flex-col gap-3 p-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : notifs.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Sem notificações.</p>
            ) : (
              <div className="px-4 py-1">
                {notifs.map((n) => {
                  const { emoji, bg } = notifIcon(n.tipo);
                  return (
                    <div key={n.id} className="flex items-start gap-3 py-3.5 border-b border-gray-200 last:border-b-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${bg}`}>
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold">{n.titulo}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{n.subtitulo}</div>
                        {n.prazo && (
                          <div className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${n.urgente ? "text-red-400" : "text-yellow-400"}`}>
                            ⏰ Prazo: {n.prazo}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => dispensarNotif(n.id)}
                        className="text-gray-300 hover:text-gray-600 transition text-base leading-none px-1 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACESSO RÁPIDO */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden" style={{ background: "#ffffff" }}>
            <div className="px-5 py-3.5 border-b border-gray-200">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Acesso Rápido</span>
            </div>
            <div className="flex flex-col gap-2 p-3">
              {[
                { href: "/coaching",        icon: "📊", bg: "bg-purple-400/15", label: "Marcar Coaching" },
                { href: "/inventario",      icon: "📦", bg: "bg-orange-400/15", label: "Requisitar Item" },
                { href: "/availabilities",  icon: "🕐", bg: "bg-blue-400/15",   label: "Ver Disponibilidades" },
                ...(isProfessor
                  ? [{ href: "/professor/validar", icon: "✅", bg: "bg-green-400/15", label: "Validar Aulas" }]
                  : []),
              ].map((item) => (
                <Link
  key={item.href}
  href={item.href}
  className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:translate-x-0.5 transition-all"
  style={{ background: "#f9f9f9", color: "#1a1714", textDecoration: "none" }}
>
  <span className="text-[13px] font-medium flex-1">{item.label}</span>
  <span className="text-gray-400 text-sm">›</span>
</Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-200">
        © {new Date().getFullYear()} Studio Éleva — Escola de Dança
      </footer>

    </div>
  );
}