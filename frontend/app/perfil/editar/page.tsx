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

export default function EditarPerfilPage() {
  const apiBase = getApiBase();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [novoNome, setNovoNome] = useState("");

  const carregarSessao = useCallback(async () => {
    setLoading(true);
    setError("");
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
      setNovoNome(data.user.name);
    } catch (e) {
      setError("Erro ao carregar dados de perfil.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  async function guardarAlteracoes(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!novoNome.trim()) {
      setError("O nome não pode estar vazio.");
      return;
    }

    if (!user) {
      setError("Não há sessão ativa.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${apiBase}/users/${user.id_user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: novoNome.trim(),
          email: user.email,
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string; message?: string };
        throw new Error(errorData.error || errorData.message || "Falha ao guardar alterações.");
      }

      setSuccess("Perfil atualizado com sucesso!");
      await carregarSessao();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar alterações.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto w-full max-w-3xl px-6 pt-6 pb-8">
        <section className="rounded-2xl bg-white p-6 shadow">
          {loading ? (
            <p className="text-gray-600">A carregar sessão...</p>
          ) : user ? (
            <>
              <h1 className="text-2xl font-semibold mb-6">Editar Perfil</h1>

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

              <form onSubmit={guardarAlteracoes} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-gray-500"
                    placeholder="O teu nome"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Este é o nome que aparece no teu perfil.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 outline-none cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    O email não pode ser alterado neste momento.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-slate-900 px-6 py-2 text-white font-medium hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "A guardar..." : "Guardar Alterações"}
                  </button>
                  <Link href="/perfil">
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <p className="text-gray-600">Não há sessão ativa.</p>
          )}
        </section>
      </main>
    </div>
  );
}
