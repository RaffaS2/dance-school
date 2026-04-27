"use client";

import { useState } from "react";

export default function NovoCoachingForm({
  prof,
  alunos,
  mods,
  est,
}: any) {
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedModalidade, setSelectedModalidade] = useState("");
  const [selectedEstudio, setSelectedEstudio] = useState("");

  const [horarios, setHorarios] = useState<any[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  // buscar horários com DATA + HORA
  const handleProfessorChange = async (id: string) => {
    setSelectedProfessor(id);
    setHorarios([]);
    setHorarioSelecionado("");

    try {
      const res = await fetch(
        `http://localhost:3001/professors/${id}/availabilities`
      );

      const data = await res.json();

      setHorarios(data); // agora guardas tudo (data + hora)
    } catch (err) {
      console.error(err);
    }
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (
      !selectedProfessor ||
      !selectedAluno ||
      !selectedModalidade ||
      !selectedEstudio ||
      !horarioSelecionado
    ) {
      alert("Preenche todos os campos!");
      return;
    }

    // separar data e hora
    const [date, time] = horarioSelecionado.split(" ");

    try {
      const res = await fetch("http://localhost:3001/coachings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_professor: selectedProfessor,
          id_studio: selectedEstudio,
          id_modality: selectedModalidade,
          date: date,
          start_time: time,
          duration_minutes: 60,
          status: "pendente",
          price: 0,
        }),
      });

      const coaching = await res.json();

      await fetch("http://localhost:3001/studentCoachings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_student: selectedAluno,
          id_coaching: coaching.id_coaching,
        }),
      });

      alert(" Coaching criado com sucesso!");

    } catch (error) {
      console.error(error);
      alert("Erro ao criar coaching");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Novo Coaching</h2>

      {/* Professor */}
      <select
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => handleProfessorChange(e.target.value)}
      >
        <option value="">Selecionar Professor</option>
        {prof.map((p: any) => (
          <option key={p.id_professor} value={p.id_professor}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Aluno */}
      <select
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setSelectedAluno(e.target.value)}
      >
        <option value="">Selecionar Aluno</option>
        {alunos.map((a: any) => (
          <option key={a.id_student} value={a.id_student}>
            {a.name}
          </option>
        ))}
      </select>

      {/* Modalidade */}
      <select
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setSelectedModalidade(e.target.value)}
      >
        <option value="">Selecionar Modalidade</option>
        {mods.map((m: any) => (
          <option key={m.id_modality} value={m.id_modality}>
            {m.name}
          </option>
        ))}
      </select>

      {/* Estúdio */}
      <select
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setSelectedEstudio(e.target.value)}
      >
        <option value="">Selecionar Estúdio</option>
        {est.map((e: any) => (
          <option key={e.id_studio} value={e.id_studio}>
            {e.name}
          </option>
        ))}
      </select>

      {/* Horários com DATA + HORA */}
      {selectedProfessor && (
        <div className="mb-4">
          <p className="mb-2 font-medium">Horários disponíveis:</p>

          <div className="flex gap-2 flex-wrap">
            {horarios.map((h: any) => {
              const data = h.date?.split("T")[0];
              const hora = h.start_time.slice(0, 5);

              const valor = `${data} ${hora}`;

              return (
                <button
                  key={valor}
                  onClick={() => setHorarioSelecionado(valor)}
                  className={`px-3 py-1 rounded ${
                    horarioSelecionado === valor
                      ? "bg-black text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {data} - {hora}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-gray-600 text-white py-2 rounded"
      >
        Confirmar
      </button>
    </div>
  );
}