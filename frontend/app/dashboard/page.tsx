"use client";

import { useEffect, useState, useCallback } from "react";
import { getApiBase } from "../lib/apiBase";

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
export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>(INITIAL);

  const fetchDashboard = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const [usersRaw, coachingsRaw, professorsRaw, modalitiesRaw] =
      await Promise.allSettled([
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
            .filter((c) => c.scheduled_date ?? c.date)
            .sort((a, b) => {
              const da = new Date(a.scheduled_date ?? a.date ?? "").getTime();
              const db = new Date(b.scheduled_date ?? b.date ?? "").getTime();
              return da - db;
            })
            .slice(0, 6)
        : [];

    const modalityList: Modality[] =
      modalitiesRaw.status === "fulfilled"
        ? toArray<Modality>(modalitiesRaw.value).slice(0, 8)
        : [];

    setState({
      loading: false,
      error: null,
      users: count(usersRaw),
      coachingsCount: count(coachingsRaw),
      professors: count(professorsRaw),
      modalitiesCount: count(modalitiesRaw),
      coachings: coachingList,
      modalities: modalityList,
    });
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statCards = [
    { label: "Utilizadores",   value: state.users,           color: "text-blue-600" },
    { label: "Aulas Marcadas", value: state.coachingsCount,  color: "text-emerald-600" },
    { label: "Professores",    value: state.professors,      color: "text-violet-600" },
    { label: "Modalidades",    value: state.modalitiesCount, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("pt-PT", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          ↺ Atualizar
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">

        {/* Error */}
        {state.error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            ⚠️ {state.error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              {state.loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-8 w-16 bg-gray-100 rounded" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
              ) : (
                <>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Próximas Aulas */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Próximas Aulas</h2>
              <span className="text-xs text-gray-400">{state.coachings.length} resultados</span>
            </div>

            <div className="divide-y divide-gray-50">
              {state.loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-100 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                ))
              ) : state.coachings.length > 0 ? (
                state.coachings.map((c) => {
                  const name =
                    c.modality?.name ?? c.modality?.nome ?? c.modality_name ?? c.nome ?? "Aula";
                  const rawDate = c.scheduled_date ?? c.date ?? null;
                  const professor = c.professor?.name ?? c.professor?.nome ?? null;
                  let dateStr = "—";
                  let timeStr = "";
                  if (rawDate) {
                    const d = new Date(rawDate);
                    dateStr = d.toLocaleDateString("pt-PT", {
                      weekday: "short", day: "2-digit", month: "short",
                    });
                    timeStr = c.start_time ?? c.hora ?? d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
                  }
                  return (
                    <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{name}</p>
                        {professor && <p className="text-xs text-gray-400 mt-0.5">{professor}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-600 capitalize">{dateStr}</p>
                        {timeStr && <p className="text-xs text-gray-400">{timeStr}</p>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-10 text-center text-sm text-gray-400">
                  Sem aulas agendadas
                </div>
              )}
            </div>
          </div>

          {/* Modalidades */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Modalidades</h2>
            </div>
            <div className="px-6 py-4">
              {state.loading ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : state.modalities.length > 0 ? (
                <ul className="space-y-1">
                  {state.modalities.map((m) => (
                    <li
                      key={m.id}
                      className="text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {m.name ?? m.nome ?? "—"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">Sem modalidades</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}