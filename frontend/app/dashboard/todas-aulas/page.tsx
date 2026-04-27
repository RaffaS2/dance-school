"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Aula = {
  id: number;
  modalidade: string;
  titulo: string;
  professor: string;
  sala: string;
  data: string;
  horaInicio: string;
  horaFim: string;
};

const aulasMock: Aula[] = [
  {
    id: 1,
    modalidade: "Ballet",
    titulo: "Ballet Individual",
    professor: "Maria Santos",
    sala: "Sala A - Ballet",
    data: "10 de março, 2026",
    horaInicio: "10:00",
    horaFim: "11:00",
  },
  {
    id: 2,
    modalidade: "Hip-Hop",
    titulo: "Hip-Hop em Grupo",
    professor: "Carlos Ribeiro",
    sala: "Estúdio 2 - Urbano",
    data: "12 de março, 2026",
    horaInicio: "18:00",
    horaFim: "19:30",
  },
  {
    id: 3,
    modalidade: "Contemporâneo",
    titulo: "Contemporâneo Intermédio",
    professor: "Ana Costa",
    sala: "Sala C - Contemporâneo",
    data: "15 de março, 2026",
    horaInicio: "19:00",
    horaFim: "20:00",
  },
  {
    id: 4,
    modalidade: "Ballet",
    titulo: "Ballet Avançado",
    professor: "Joana Almeida",
    sala: "Sala A - Ballet",
    data: "18 de março, 2026",
    horaInicio: "09:00",
    horaFim: "10:30",
  },
  {
    id: 5,
    modalidade: "Hip-Hop",
    titulo: "Hip-Hop Coreográfico",
    professor: "Rui Martins",
    sala: "Estúdio 2 - Urbano",
    data: "20 de março, 2026",
    horaInicio: "17:00",
    horaFim: "18:00",
  },
];

export default function MinhasAulasPage() {
  const [filtro, setFiltro] = useState("Todas");

  const modalidades = useMemo(() => {
    const lista = aulasMock.map((a) => a.modalidade);
    return ["Todas", ...new Set(lista)];
  }, []);

  const aulasFiltradas = useMemo(() => {
    if (filtro === "Todas") return aulasMock;
    return aulasMock.filter((a) => a.modalidade === filtro);
  }, [filtro]);

  return (
    <div className="min-h-screen bg-gray-100 text-zinc-900">
      {/* HEADER */}
      <header className="mb-6 bg-white px-6 py-4 shadow">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Todas as Aulas</h1>
            <p className="text-sm text-gray-600">
              Consulte todas as aulas disponíveis e filtradas por modalidade.
            </p>
          </div>

          <Link href="/dashboard">
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              Voltar ao Dashboard
            </button>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-10 space-y-6">
        {/* FILTROS */}
        <section className="flex flex-wrap gap-3">
          {modalidades.map((mod) => (
            <button
              key={mod}
              onClick={() => setFiltro(mod)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtro === mod
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {mod}
            </button>
          ))}
        </section>

        {/* LISTA DE AULAS */}
        <section className="space-y-4">
          {aulasFiltradas.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              Não existem aulas nesta modalidade.
            </div>
          )}

          {aulasFiltradas.map((aula) => (
            <article
              key={aula.id}
              className="rounded-xl bg-white p-5 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{aula.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    {aula.modalidade} • {aula.professor}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {aula.data} • {aula.horaInicio} - {aula.horaFim}
                  </p>
                  <p className="text-sm text-gray-500">{aula.sala}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
