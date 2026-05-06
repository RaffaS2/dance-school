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
  return userType !== 3;
}

const cards = {
  todos: [
    {
      href: "/coaching",
      titulo: "Coaching",
      descricao: "Gestão de sessões de coaching.",
      icon: "🎯",
    },
    {
      href: "/inventario",
      titulo: "Inventário",
      descricao: "Controle de itens e requisições.",
      icon: "📦",
    },
  ],
  professor: [
    {
      href: "/professor/validar",
      titulo: "Validação de Aulas",
      descricao: "Aprovação de marcações pelo professor.",
      icon: "✅",
    },
    {
      href: "/availabilities",
      titulo: "Disponibilidades",
      descricao: "Gestão de horários disponíveis.",
      icon: "📅",
    },
  ],
};

export default function HomePage() {
  const apiBase = getApiBase();
  const [utilizador, setUtilizador] = useState<SessionUser | null>(null);
  const [isProfessor, setIsProfessor] = useState(false);
  const [loadingSessao, setLoadingSessao] = useState(true);

  const carregarSessao = useCallback(async () => {
    setLoadingSessao(true);
    try {
      const res = await fetch(`${apiBase}/auth/me`, {
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

  const todosCards = isProfessor
    ? [...cards.todos, ...cards.professor]
    : cards.todos;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #fff5f7 0%, #fdf6f0 50%, #fef9f5 100%)" }}>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-6 py-28 overflow-hidden">

        {/* Círculos decorativos de fundo */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #fcd5b0, transparent)" }} />

        <Image
          src="/logo.png"
          alt="Ent'Artes Logo"
          width={220}
          height={220}
          className="w-44 max-w-full mb-10 h-auto opacity-90"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300 mb-3">
          Escola de Dança
        </p>

        <h1 className="text-5xl font-light tracking-tight mb-4 text-stone-700">
          Bem-vinda à{" "}
          <span className="font-semibold text-rose-400">Ent&apos;Artes</span>
        </h1>

        <p className="text-stone-400 mb-10 max-w-sm text-base leading-relaxed">
          Dedicada ao desenvolvimento artístico e pessoal de cada bailarina.
        </p>

        <Link href="/dashboard">
          <button className="bg-rose-400 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-rose-500 transition shadow-lg shadow-rose-200 cursor-pointer">
            Entrar na plataforma →
          </button>
        </Link>
      </section>

      {/* DIVISOR */}
      <div className="flex items-center gap-4 px-10 max-w-5xl mx-auto w-full mb-10">
        <div className="flex-1 h-px bg-rose-100" />
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-300">
          Acesso rápido
        </p>
        <div className="flex-1 h-px bg-rose-100" />
      </div>

      {/* CARDS */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div
          className={`grid gap-5 ${
            todosCards.length === 4
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-2"
          }`}
        >
          {todosCards.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <div className="h-full flex flex-col items-center text-center p-8 rounded-3xl border border-rose-100 bg-white/80 backdrop-blur-sm hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 transition-all duration-300">
                <span className="text-4xl mb-5">{card.icon}</span>
                <h3 className="text-base font-semibold text-stone-700 mb-2">
                  {card.titulo}
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed flex-1">
                  {card.descricao}
                </p>
                <span className="mt-6 text-xs font-medium text-rose-300 group-hover:text-rose-500 transition">
                  Abrir →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-stone-300 text-sm border-t border-rose-100">
        © {new Date().getFullYear()} Ent&apos;Artes — Escola de Dança
      </footer>

    </div>
  );
}