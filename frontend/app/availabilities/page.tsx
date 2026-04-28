"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getApiBase } from "../lib/apiBase";

type SessionUser = {
  id_user: number;
  name: string;
  email: string;
  id_user_type: number;
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

export default function AvailabilitiesPage() {
  const apiBase = getApiBase();

  const [utilizadorAtual, setUtilizadorAtual] = useState<SessionUser | null>(null);
  const [loadingSessao, setLoadingSessao] = useState(true);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // ── 1. Carregar sessão ──────────────────────────────────────────────────
  const carregarSessao = useCallback(async () => {
    setLoadingSessao(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        setUtilizadorAtual(null);
        return;
      }
      const data = await res.json();
      setUtilizadorAtual(data.user);
    } catch {
      setUtilizadorAtual(null);
    } finally {
      setLoadingSessao(false);
    }
  }, [apiBase]);

  // ── 2. Carregar disponibilidades ────────────────────────────────────────
  const carregarAvailabilities = useCallback(async () => {
    setErro("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/availabilities`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao buscar disponibilidades");
      const data: Availability[] = await res.json();
      setAvailabilities(data);
    } catch {
      setErro("Não foi possível carregar as disponibilidades.");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // ── 3. Efeitos ──────────────────────────────────────────────────────────
  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  useEffect(() => {
    void carregarAvailabilities();
  }, [carregarAvailabilities]);

  // ── 4. Filtrar no frontend por id_user ──────────────────────────────────
  const availabilidadesFiltradas = (() => {
    if (!utilizadorAtual) return [];

    // Admin (1) vê todas
    if (utilizadorAtual.id_user_type === 1) return availabilities;

    // Professor (2) — filtra pelo id_user devolvido pelo backend
    if (utilizadorAtual.id_user_type === 2) {
      return availabilities.filter(
        (a) => a.id_user === utilizadorAtual.id_user
      );
    }

    return [];
  })();

  // ── 5. Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 text-zinc-900">

      {/* Header */}
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
              <h1 className="text-xl font-bold">Disponibilidades</h1>
              <p className="text-sm text-gray-600">
                Utilizador: {utilizadorAtual?.name ?? "Não autenticado"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/availabilities/novo">
              <button className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                + Marcar Disponibilidade
              </button>
            </Link>
            <Link href="/">
              <button className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                Página Inicial
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-8">

        {/* Aviso de sessão */}
        {!loadingSessao && !utilizadorAtual && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow">
            Sessão não encontrada. Inicia sessão em{" "}
            <Link href="/login" className="font-semibold underline">
              /login
            </Link>{" "}
            para veres as disponibilidades.
          </div>
        )}

        {/* Loading */}
        {(loading || loadingSessao) && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow">
            A carregar disponibilidades...
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow">
            {erro}
          </div>
        )}

        {/* Resumo */}
        {!loading && !loadingSessao && utilizadorAtual && (
          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="text-lg font-semibold">Resumo</h2>
            <p className="mt-1 text-sm text-gray-600">
              {availabilidadesFiltradas.length === 0
                ? "Sem disponibilidades registadas."
                : <><strong>{availabilidadesFiltradas.length}</strong> disponibilidade(s) registada(s).</>
              }
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && !loadingSessao && utilizadorAtual && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {availabilidadesFiltradas.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Sem disponibilidades para mostrar.
              </div>
            ) : (
              availabilidadesFiltradas.map((a) => (
                <article
                  key={a.id_availability}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <p className="font-semibold">Professor: {a.professor}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Dia: {new Date(a.date).toLocaleDateString("pt-PT")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Hora Início: {a.start_time}
                  </p>
                  <p className="text-xs text-gray-500">
                    Hora Fim: {a.end_time}
                  </p>
                </article>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}