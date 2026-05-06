"use client";

import { useState, useEffect } from "react";
import { getApiBase } from "../../lib/apiBase";

export default function NovaDisponibilidadeForm({ professores }: any) {
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [userType, setUserType] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${getApiBase()}/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user
        setUserType(user.id_user_type)

        if (user.id_user_type === 2) {
          fetch(`${getApiBase()}/professors`, { credentials: "include" })
            .then((res) => res.json())
            .then((profs) => {
              const meuPerfil = profs.find((p: any) => p.id_user === user.id_user)
              if (meuPerfil) {
                setSelectedProfessor(String(meuPerfil.id_professor))
              }
            })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selectedProfessor || !date || !startTime || !endTime) {
      alert("Preenche todos os campos!");
      return;
    }

    try {
      const formattedDate = date;

      const res = await fetch(`${getApiBase()}/availabilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_professor: Number(selectedProfessor),
          date: formattedDate,
          start_time: startTime,
          end_time: endTime,
          recurring,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar disponibilidade");
      }

      alert("Disponibilidade criada com sucesso!");

      setDate("");
      setStartTime("");
      setEndTime("");
      setRecurring(false);
      if (userType === 1) setSelectedProfessor("");

    } catch (error: any) {
      console.error("ERRO:", error);
      alert(error.message);
    }
  };

  if (loading) return <p className="text-center text-gray-500">A carregar...</p>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow max-w-md">

        {/* Selector de professor — desativado para Professor, ativo para Admin */}
        <select
          className="w-full mb-4 p-2 border rounded bg-gray-100 text-gray-500 disabled:cursor-not-allowed"
          value={selectedProfessor}
          onChange={(e) => setSelectedProfessor(e.target.value)}
          disabled={userType === 2}
        >
          <option value="">Selecionar Professor</option>
          {professores.map((p: any) => (
            <option key={p.id_professor} value={p.id_professor}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Data */}
        <input
          type="date"
          className="w-full mb-4 p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Hora início */}
        <input
          type="time"
          className="w-full mb-4 p-2 border rounded"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        {/* Hora fim */}
        <input
          type="time"
          className="w-full mb-4 p-2 border rounded"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        {/* Botão */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gray-600 text-white py-2 rounded"
        >
          Guardar Disponibilidade
        </button>
      </div>
    </div>
  );
}
