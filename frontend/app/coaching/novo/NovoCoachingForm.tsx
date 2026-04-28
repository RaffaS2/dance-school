"use client";

import { useEffect, useState } from "react";

export default function NovoCoachingForm({ prof, alunos, mods, est, sessao }: any) {
  const utilizador = sessao?.user;
  const tipoUtilizador = utilizador?.id_user_type; // 1=admin, 2=professor, 3=aluno/encarregado

  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedModalidade, setSelectedModalidade] = useState("");
  const [selectedEstudio, setSelectedEstudio] = useState("");
  const [horarios, setHorarios] = useState<any[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  // Pré-selecionar professor se o utilizador for professor
  useEffect(() => {
    if (tipoUtilizador === 2 && utilizador) {
      const profEncontrado = prof.find((p: any) => p.id_user === utilizador.id_user);
      if (profEncontrado) {
        const id = String(profEncontrado.id_professor);
        setSelectedProfessor(id);
        void fetchHorarios(id);
      }
    }
  }, [tipoUtilizador, utilizador, prof]);

  // Pré-selecionar aluno se o utilizador for aluno/encarregado
  useEffect(() => {
    if (tipoUtilizador === 3 && utilizador) {
      const alunoEncontrado = alunos.find((a: any) => a.id_user === utilizador.id_user);
      if (alunoEncontrado) {
        setSelectedAluno(String(alunoEncontrado.id_student));
      }
    }
  }, [tipoUtilizador, utilizador, alunos]);

  const fetchHorarios = async (id: string) => {
    setHorarios([]);
    setHorarioSelecionado("");
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3001/professors/${id}/availabilities`);
      const data = await res.json();
      setHorarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfessorChange = async (id: string) => {
    setSelectedProfessor(id);
    await fetchHorarios(id);
  };

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

    const [date, time] = horarioSelecionado.split(" ");

    try {
      const res = await fetch("http://localhost:3001/coachings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_professor: selectedProfessor,
          id_studio: selectedEstudio,
          id_modality: selectedModalidade,
          date,
          start_time: time,
          duration_minutes: 60,
          status: "pendente",
          price: 0,
        }),
      });

      const coaching = await res.json();

      await fetch("http://localhost:3001/studentCoachings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_student: selectedAluno,
          id_coaching: coaching.id_coaching,
        }),
      });

      alert("Coaching criado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar coaching");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Novo Coaching</h2>

      {/* Professor — bloqueado se for professor */}
      <select
        className="w-full mb-3 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        value={selectedProfessor}
        disabled={tipoUtilizador === 2}
        onChange={(e) => handleProfessorChange(e.target.value)}
      >
        <option value="">Selecionar Professor</option>
        {prof.map((p: any) => (
          <option key={p.id_professor} value={p.id_professor}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Aluno — bloqueado se for aluno/encarregado */}
      <select
        className="w-full mb-3 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        value={selectedAluno}
        disabled={tipoUtilizador === 3}
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
        value={selectedModalidade}
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
        value={selectedEstudio}
        onChange={(e) => setSelectedEstudio(e.target.value)}
      >
        <option value="">Selecionar Estúdio</option>
        {est.map((e: any) => (
          <option key={e.id_studio} value={e.id_studio}>
            {e.name}
          </option>
        ))}
      </select>

      {/* Horários */}
      {selectedProfessor && (
        <div className="mb-4">
          <p className="mb-2 font-medium">Horários disponíveis:</p>
          <div className="flex gap-2 flex-wrap">
            {horarios.length === 0 ? (
              <p className="text-sm text-gray-400">Sem horários disponíveis.</p>
            ) : (
              horarios.map((h: any) => {
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
              })
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
      >
        Confirmar
      </button>
    </div>
  );
}