"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const professores = [
  { nome: "Maria", horarios: ["10:00", "14:00", "18:00"] },
  { nome: "João", horarios: ["09:00", "13:00", "17:00"] },
];

const alunos = ["Ana", "Pedro", "Carlos"];

export default function NovoCoachingPage() {
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  const handleProfessorChange = (prof: string) => {
    setSelectedProfessor(prof);
    const p = professores.find((p) => p.nome === prof);
    setHorarios(p ? p.horarios : []);
    setHorarioSelecionado("");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow mb-6">
        {/* Esquerda */}
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Ent'Artes Logo"
            width={144}
            height={48}
            className="h-12 w-auto object-contain"
          />
          <h1 className="text-xl font-bold">Requisitar Coaching</h1>
        </div>

        {/* Direita */}
        <Link href="/coaching">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
            Voltar
          </button>
        </Link>
      </header>

      {/* Conteúdo */}
      <div className="p-6 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4">Novo Coaching</h2>

          {/* Aluno */}
          <select className="w-full mb-4 p-2 border rounded">
            <option>Selecionar Aluno</option>
            {alunos.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          {/* Professor */}
          <select
            className="w-full mb-4 p-2 border rounded"
            onChange={(e) => handleProfessorChange(e.target.value)}
          >
            <option>Selecionar Professor</option>
            {professores.map((p) => (
              <option key={p.nome}>{p.nome}</option>
            ))}
          </select>

          {/* Horários */}
          {selectedProfessor && (
            <div className="mb-4">
              <p className="mb-2 font-medium">Horários disponíveis:</p>

              <div className="flex gap-2 flex-wrap">
                {horarios.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorarioSelecionado(h)}
                    className={`px-3 py-1 rounded-lg ${
                      horarioSelecionado === h
                        ? "bg-black text-white"
                        : "bg-gray-400 text-white hover:bg-gray-500"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botão */}
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}