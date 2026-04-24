"use client";

import { useState } from "react";
import Link from "next/link";

export default function NovaDisponibilidadeForm({ professores }: any) {
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = async () => {
    if (!selectedProfessor || !date || !startTime || !endTime) {
      alert("Preenche todos os campos!");
      return;
    }

    try {
      // 🔥 converter data para formato correto (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split("T")[0];

      const res = await fetch("http://localhost:3001/availabilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_professor: Number(selectedProfessor), // 🔥 importante
          date: formattedDate,
          start_time: startTime,
          end_time: endTime,
          recurring,
        }),
      });

      const data = await res.json();

      console.log("RESPOSTA BACKEND:", data);

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar disponibilidade");
      }

      alert("✅ Disponibilidade criada com sucesso!");

      // limpar form
      setSelectedProfessor("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setRecurring(false);

    } catch (error: any) {
      console.error("ERRO:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Form */}
      <div className="bg-white p-6 rounded shadow max-w-md">

        {/* Professor */}
        <select
          className="w-full mb-4 p-2 border rounded"
          value={selectedProfessor}
          onChange={(e) => setSelectedProfessor(e.target.value)}
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

        {/* Recorrente */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
          Recorrente
        </label>

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