"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getApiBase } from "../../lib/apiBase";

type SessionUser = {
  id_user: number;
  name: string;
  email: string;
  id_user_type: number;
};

type Studio = {
  id_studio: number;
  name: string;
  location?: string;
};

type Modality = {
  id_modality: number;
  name: string;
};

export default function AdminStudiosPage() {
  const apiBase = getApiBase();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states for studio
  const [novoNomeStudio, setNovoNomeStudio] = useState("");
  const [novaLocalizacaoStudio, setNovaLocalizacaoStudio] = useState("");
  const [submittingStudio, setSubmittingStudio] = useState(false);

  // Form states for modality
  const [novoNomeModalidade, setNovoNomeModalidade] = useState("");
  const [submittingModality, setSubmittingModality] = useState(false);

  // State for deletion
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [tipoRemocao, setTipoRemocao] = useState<"studio" | "modality" | null>(null);

  const carregarSessao = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user: SessionUser };
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, [apiBase]);

  const carregarDados = useCallback(async () => {
    setError("");
    try {
      const [studiosRes, modalitiesRes] = await Promise.all([
        fetch(`${apiBase}/studios`, { credentials: "include" }),
        fetch(`${apiBase}/modalities`, { credentials: "include" }),
      ]);

      if (studiosRes.ok) {
        const studiosData = (await studiosRes.json()) as Studio[];
        setStudios(studiosData);
      }

      if (modalitiesRes.ok) {
        const modalitiesData = (await modalitiesRes.json()) as Modality[];
        setModalities(modalitiesData);
      }
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  useEffect(() => {
    if (user) {
      void carregarDados();
    }
  }, [user, carregarDados]);

  async function adicionarStudio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!novoNomeStudio.trim()) {
      setError("O nome do estúdio não pode estar vazio.");
      return;
    }

    setSubmittingStudio(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBase}/studios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: novoNomeStudio.trim(),
          location: novaLocalizacaoStudio.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string; message?: string };
        throw new Error(errorData.error || errorData.message || "Falha ao criar estúdio.");
      }

      setSuccess("Estúdio adicionado com sucesso!");
      setNovoNomeStudio("");
      setNovaLocalizacaoStudio("");
      await carregarDados();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar estúdio.");
    } finally {
      setSubmittingStudio(false);
    }
  }

  async function adicionarModalidade(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!novoNomeModalidade.trim()) {
      setError("O nome da modalidade não pode estar vazio.");
      return;
    }

    setSubmittingModality(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBase}/modalities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: novoNomeModalidade.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string; message?: string };
        throw new Error(errorData.error || errorData.message || "Falha ao criar modalidade.");
      }

      setSuccess("Modalidade adicionada com sucesso!");
      setNovoNomeModalidade("");
      await carregarDados();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar modalidade.");
    } finally {
      setSubmittingModality(false);
    }
  }

  async function removerStudio(studioId: number, studioName: string) {
    const confirmado = window.confirm(
      `Tens a certeza que queres remover o estúdio "${studioName}"? Esta ação não pode ser desfeita se o estúdio não estiver em uso.`
    );
    if (!confirmado) return;

    setRemovendoId(studioId);
    setTipoRemocao("studio");
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBase}/studios/${studioId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string; message?: string };
        throw new Error(errorData.error || errorData.message || "Falha ao remover estúdio. Pode estar em uso.");
      }

      setSuccess("Estúdio removido com sucesso!");
      await carregarDados();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover estúdio.");
    } finally {
      setRemovendoId(null);
      setTipoRemocao(null);
    }
  }

  async function removerModalidade(modalityId: number, modalityName: string) {
    const confirmado = window.confirm(
      `Tens a certeza que queres remover a modalidade "${modalityName}"? Esta ação não pode ser desfeita se a modalidade não estiver em uso.`
    );
    if (!confirmado) return;

    setRemovendoId(modalityId);
    setTipoRemocao("modality");
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBase}/modalities/${modalityId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string; message?: string };
        throw new Error(errorData.error || errorData.message || "Falha ao remover modalidade. Pode estar em uso.");
      }

      setSuccess("Modalidade removida com sucesso!");
      await carregarDados();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover modalidade.");
    } finally {
      setRemovendoId(null);
      setTipoRemocao(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-6">
        <main className="mx-auto w-full max-w-6xl px-6 pb-8">
          <p className="text-gray-600">A carregar...</p>
        </main>
      </div>
    );
  }

  if (!user || user.id_user_type !== 1) {
    return (
      <div className="min-h-screen bg-gray-100 pt-6">
        <main className="mx-auto w-full max-w-6xl px-6 pb-8">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-semibold">Acesso negado</p>
            <p className="mt-2 text-sm">Apenas administradores podem aceder a esta página.</p>
            <Link href="/" className="mt-3 inline-block text-sm font-medium underline hover:no-underline">
              Voltar à página inicial
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto w-full max-w-6xl px-6 pt-6 pb-8">
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Estúdios */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Adicionar Estúdio</h2>

            <form onSubmit={adicionarStudio} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Estúdio
                </label>
                <input
                  type="text"
                  value={novoNomeStudio}
                  onChange={(e) => setNovoNomeStudio(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-gray-500"
                  placeholder="Ex: Estúdio Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização (opcional)
                </label>
                <input
                  type="text"
                  value={novaLocalizacaoStudio}
                  onChange={(e) => setNovaLocalizacaoStudio(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-gray-500"
                  placeholder="Ex: Rua das Flores, Lisboa"
                />
              </div>

              <button
                type="submit"
                disabled={submittingStudio}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingStudio ? "A adicionar..." : "Adicionar Estúdio"}
              </button>
            </form>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Estúdios ({studios.length})</h3>
              <div className="space-y-2">
                {studios.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum estúdio adicionado ainda.</p>
                ) : (
                  studios.map((studio) => (
                    <div key={studio.id_studio} className="rounded-lg bg-gray-50 p-3 text-sm flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{studio.name}</p>
                        {studio.location && <p className="text-gray-600">{studio.location}</p>}
                      </div>
                      <button
                        onClick={() => removerStudio(studio.id_studio, studio.name)}
                        disabled={removendoId === studio.id_studio && tipoRemocao === "studio"}
                        className="mt-1 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                      >
                        {removendoId === studio.id_studio && tipoRemocao === "studio" ? "A remover..." : "Remover"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Modalidades */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Adicionar Modalidade</h2>

            <form onSubmit={adicionarModalidade} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Modalidade
                </label>
                <input
                  type="text"
                  value={novoNomeModalidade}
                  onChange={(e) => setNovoNomeModalidade(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-gray-500"
                  placeholder="Ex: Ballet Clássico"
                />
              </div>

              <button
                type="submit"
                disabled={submittingModality}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingModality ? "A adicionar..." : "Adicionar Modalidade"}
              </button>
            </form>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Modalidades ({modalities.length})</h3>
              <div className="space-y-2">
                {modalities.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma modalidade adicionada ainda.</p>
                ) : (
                  modalities.map((modality) => (
                    <div key={modality.id_modality} className="rounded-lg bg-gray-50 p-3 text-sm flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900">{modality.name}</p>
                      <button
                        onClick={() => removerModalidade(modality.id_modality, modality.name)}
                        disabled={removendoId === modality.id_modality && tipoRemocao === "modality"}
                        className="mt-0 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                      >
                        {removendoId === modality.id_modality && tipoRemocao === "modality" ? "A remover..." : "Remover"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
