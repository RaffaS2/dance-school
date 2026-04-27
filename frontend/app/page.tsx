"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getApiBase } from "./lib/apiBase";

type SessionUser = {
  id_user: number;
  name: string;
  email: string;
  id_user_type: number;
};

function isProfessorOrAdmin(userType: number) {
  return userType !== 3; // 3 = utilizador normal
}

export default function HomePage() {
  const apiBase = getApiBase();
  const [utilizador, setUtilizador] = useState<SessionUser | null>(null);
  const [isProfessor, setIsProfessor] = useState(false);
  const [loadingSessao, setLoadingSessao] = useState(true);

  const carregarSessao = useCallback(async () => {
    setLoadingSessao(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUtilizador(null);
        setIsProfessor(false);
        return;
      }

      const data = (await res.json()) as { user: SessionUser };
      setUtilizador(data.user);
      setIsProfessor(isProfessorOrAdmin(data.user.id_user_type));
    } catch {
      setUtilizador(null);
      setIsProfessor(false);
    } finally {
      setLoadingSessao(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  async function terminarSessao() {
    try {
      await fetch(`${apiBase}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUtilizador(null);
      setIsProfessor(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Ent'Artes Logo"
            width={144}
            height={48}
            className="h-12 w-auto object-contain"
          />
        </div>

        <nav className="flex gap-3">
          {loadingSessao ? (
            <button
              className="border border-black px-4 py-2 rounded-lg bg-white text-black"
              disabled
            >
              A carregar...
            </button>
          ) : utilizador ? (
            <>
              <Link href="/dashboard">
                <button className="border border-black px-4 py-2 rounded-lg hover:bg-gray-100">
                  {utilizador.name}
                </button>
              </Link>
              <button
                onClick={terminarSessao}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="border border-black px-4 py-2 rounded-lg hover:bg-gray-100">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                  Registar
                </button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-12">
        <Image
          src="/logo.png"
          alt="Ent'Artes Logo"
          width={288}
          height={288}
          className="w-72 max-w-full mb-6 h-auto"
        />

        <h2 className="text-3xl font-semibold mb-2">
          Bem-vindo à Ent&apos;Artes
        </h2>

        <p className="text-gray-600 mb-6 max-w-md">
          Escola de dança dedicada ao desenvolvimento artístico e pessoal.
        </p>

        <Link href="/dashboard">
          <button className="bg-gray-500 text-white px-6 py-3 rounded-xl text-lg hover:bg-gray-600">
            Entrar
          </button>
        </Link>
      </section>

      {/* Features */}
      <section
        className={`grid gap-6 p-6 ${
          isProfessor ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"
        }`}
      >
        {/* Coaching — todos */}
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Coaching</h3>
          <p className="text-gray-600 mb-4">Gestão de sessões de coaching.</p>
          <Link href="/coaching">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Ir para Coaching
            </button>
          </Link>
        </div>

        {/* Inventário — todos */}
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Inventário</h3>
          <p className="text-gray-600 mb-4">Controle de itens e requisições.</p>
          <Link href="/inventario">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Ir para Inventário
            </button>
          </Link>
        </div>

        {/* Validação de Aulas — só professores e admins */}
        {isProfessor && (
          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Validação de Aulas</h3>
            <p className="text-gray-600 mb-4">
              Aprovação de marcações pelo professor.
            </p>
            <Link href="/professor/validar">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Ir para Validação
              </button>
            </Link>
          </div>
        )}

        {/* Disponibilidades — só professores e admins */}
        {isProfessor && (
          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Disponibilidades</h3>
            <p className="text-gray-600 mb-4">
              Gestão de horários disponíveis.
            </p>
            <Link href="/availabilities">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Ir para Disponibilidades
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500">
        © {new Date().getFullYear()} Ent&apos;Artes
      </footer>
    </div>
  );
}