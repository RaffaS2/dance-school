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

type Professor = {
  id_professor: number;
  id_user: number;
  name: string;
};

export default function PerfilPage() {
  const apiBase = getApiBase();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSession = useCallback(async () => {
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

      if (data.user.id_user_type === 2) {
        // procura dados do professor relativos ao user
        const profRes = await fetch(`${apiBase}/professors`, {
          credentials: "include",
          cache: "no-store",
        });
        if (profRes.ok) {
          const profs = (await profRes.json()) as Professor[];
          const p = profs.find((x) => x.id_user === data.user.id_user) ?? null;
          setProfessor(p);
        }
      }
    } catch (e) {
      setError("Erro ao carregar dados de perfil.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  async function logout() {
    try {
      await fetch(`${apiBase}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Ent'Artes Logo" width={144} height={48} className="h-12 w-auto object-contain" />
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>

        <div className="flex gap-3">
          <Link href="/">
            <button className="border border-black px-4 py-2 rounded-lg hover:bg-gray-100">Página Inicial</button>
          </Link>
          <button onClick={logout} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">Sair</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <section className="rounded-2xl bg-white p-6 shadow">
          {loading ? (
            <p className="text-gray-600">A carregar sessão...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : user ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <p className="text-2xl font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">Tipo: {user.id_user_type === 1 ? "Admin" : user.id_user_type === 2 ? "Professor" : "Utilizador"}</p>

                <div className="flex gap-2 mt-4">
                  <Link href="/perfil/editar">
                    <button className="rounded-lg border border-black bg-white px-4 py-2 hover:bg-gray-100">Editar Perfil</button>
                  </Link>
                  <Link href="/resetpassword">
                    <button className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-black">Alterar Palavra-passe</button>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">ID de utilizador</p>
                  <p className="font-semibold">{user.id_user}</p>
                </div>

                {professor ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Dados de Professor</p>
                    <p className="font-semibold">ID: {professor.id_professor}</p>
                    <p className="text-sm text-gray-600">Nome: {professor.name}</p>
                  </div>
                ) : user.id_user_type === 2 ? (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">Ainda não existem dados de professor associados a este utilizador.</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Não há sessão ativa.</p>
          )}
        </section>
      </main>
    </div>
  );
}
