"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../lib/apiBase";

type SessionUser = {
  id_user: number;
  name: string;
  email: string;
  id_user_type: number;
};

type CoachingListItem = {
  id_coaching: number;
  id_professor?: number;
  professor: string | null;
  date: string;
  start_time: string;
  duration_minutes: number;
  status: string | null;
  price: number | null;
  professor_validation?: boolean | null;
  guardian_validation?: boolean | null;
  coordination_validation?: boolean | null;
};

type CoachingDetail = {
  id_coaching: number;
  id_professor: number;
  id_studio: number;
  id_modality: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  status: string | null;
  price: number | null;
  professor_validation: boolean | null;
  guardian_validation: boolean | null;
  coordination_validation: boolean | null;
};

type UpdateAction = "aceitar" | "rejeitar";

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("pt-PT");
}

function formatTime(value: string) {
  return value?.slice(0, 5) ?? "--:--";
}

function canAccessValidation(userType: number) {
  return userType !== 3;
}

function isPendingStatus(status: string | null) {
  if (!status) return true;

  const normalized = status.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("pend") ||
    normalized.includes("aguard")
  );
}

function isPendingForProfessor(coaching: CoachingListItem) {
  if (typeof coaching.professor_validation === "boolean") {
    return coaching.professor_validation === false;
  }

  if (coaching.professor_validation === null) {
    return true;
  }

  return isPendingStatus(coaching.status);
}

async function getApiErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
}

export default function ValidarAulasProfessorPage() {
  const apiBase = getApiBase();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [coachings, setCoachings] = useState<CoachingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeActionById, setActiveActionById] = useState<Record<number, UpdateAction | null>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    try {
      const sessionResponse = await fetch(`${apiBase}/api/auth/me`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!sessionResponse.ok) {
        throw new Error("Precisas de iniciar sessão para validar aulas.");
      }

      const sessionData = (await sessionResponse.json()) as { user: SessionUser };
      setUser(sessionData.user);

      if (!canAccessValidation(sessionData.user.id_user_type)) {
        setCoachings([]);
        setAccessDenied(true);
        return;
      }

      const coachingResponse = await fetch(`${apiBase}/coachings`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!coachingResponse.ok) {
        throw new Error("Não foi possível carregar os pedidos de aula.");
      }

      const coachingsData = (await coachingResponse.json()) as CoachingListItem[];
      setCoachings(coachingsData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro ao carregar a página de validação.");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const aulasPendentes = useMemo(() => {
    return coachings.filter((coaching) => isPendingForProfessor(coaching));
  }, [coachings]);

  async function atualizarValidacao(idCoaching: number, action: UpdateAction) {
    setActiveActionById((prev) => ({ ...prev, [idCoaching]: action }));
    setError("");

    try {
      const detailResponse = await fetch(`${apiBase}/coachings/${idCoaching}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!detailResponse.ok) {
        const message = await getApiErrorMessage(detailResponse, "Não foi possível ler os dados da aula.");
        throw new Error(message);
      }

      const detailPayload = (await detailResponse.json()) as CoachingDetail[] | CoachingDetail;
      const detail = Array.isArray(detailPayload) ? detailPayload[0] : detailPayload;

      if (!detail) {
        throw new Error("A aula selecionada já não está disponível.");
      }

      const approved = action === "aceitar";
      const nextStatus = approved ? "Aprovado pelo professor" : "Rejeitado pelo professor";

      const updateResponse = await fetch(`${apiBase}/coachings/${idCoaching}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_professor: detail.id_professor,
          id_studio: detail.id_studio,
          id_modality: detail.id_modality,
          date: detail.date,
          start_time: detail.start_time,
          duration_minutes: detail.duration_minutes,
          status: nextStatus,
          price: detail.price,
          professor_validation: approved,
          guardian_validation: detail.guardian_validation,
          coordination_validation: detail.coordination_validation,
        }),
      });

      if (!updateResponse.ok) {
        const message = await getApiErrorMessage(updateResponse, "Não foi possível atualizar a validação.");
        throw new Error(message);
      }

      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Falha ao validar o pedido.");
    } finally {
      setActiveActionById((prev) => ({ ...prev, [idCoaching]: null }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 shadow">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Ent'Artes Logo"
            width={144}
            height={48}
            className="h-12 w-auto object-contain"
          />
          <div>
            <p className="text-sm text-gray-500">Escola de Dança</p>
            <h1 className="text-xl font-bold">Validar Aulas</h1>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard">
            <button className="rounded-lg border border-black bg-white px-4 py-2 text-black hover:bg-gray-100">
              Dashboard
            </button>
          </Link>
          <Link href="/coaching">
            <button className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800">
              Ver Coachings
            </button>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <section className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900">Validar Aulas</h2>
          <p className="mt-2 text-gray-600">Aprove ou rejeite pedidos de aulas</p>
          {user ? (
            <p className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              Professor: {user.name}
            </p>
          ) : null}
        </section>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        ) : null}

        {!loading && !error && accessDenied ? (
          <section className="rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-xl font-semibold text-gray-900">Acesso restrito</h3>
            <p className="mt-2 text-gray-600">Esta página não está disponível para encarregados de educação.</p>
          </section>
        ) : null}

        {loading ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">A carregar pedidos...</p>
          </section>
        ) : accessDenied ? null : aulasPendentes.length === 0 ? (
          <section className="rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-xl font-semibold text-gray-900">Sem aulas pendentes</h3>
            <p className="mt-2 text-gray-600">Não tem aulas aguardando validação.</p>
          </section>
        ) : (
          <section className="space-y-4">
            {aulasPendentes.map((coaching) => {
              const currentAction = activeActionById[coaching.id_coaching];
              const blocked = currentAction === "aceitar" || currentAction === "rejeitar";

              return (
                <article
                  key={coaching.id_coaching}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Pedido #{coaching.id_coaching}</p>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Aula em {formatDate(coaching.date)} às {formatTime(coaching.start_time)}
                      </h3>
                      <p className="text-sm text-gray-600">Duração: {coaching.duration_minutes} minutos</p>
                      <p className="text-sm text-gray-600">
                        Valor: {typeof coaching.price === "number" ? `${coaching.price} EUR` : "N/D"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => atualizarValidacao(coaching.id_coaching, "rejeitar")}
                        disabled={blocked}
                        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {currentAction === "rejeitar" ? "A rejeitar..." : "Rejeitar"}
                      </button>
                      <button
                        onClick={() => atualizarValidacao(coaching.id_coaching, "aceitar")}
                        disabled={blocked}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {currentAction === "aceitar" ? "A aceitar..." : "Aceitar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
