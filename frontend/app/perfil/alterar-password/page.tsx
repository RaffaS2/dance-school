"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "../../lib/apiBase";

export default function AlterarPasswordPage() {
  const apiBase = getApiBase();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preenche todos os campos.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível alterar a palavra-passe.");
        return;
      }

      setSuccess(data.message || "Palavra-passe atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/perfil");
      }, 2000);
    } catch {
      setError("Não foi possível ligar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto w-full max-w-3xl px-6 pt-6 pb-8">
        <section className="rounded-2xl bg-white p-6 shadow space-y-5">

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
          {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{success}</div>}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Palavra-passe atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nova palavra-passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Confirmar nova palavra-passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-6 py-2 text-white font-medium hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "A guardar..." : "Guardar nova palavra-passe"}
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
        </section>
      </main>
    </div>
  );
}

