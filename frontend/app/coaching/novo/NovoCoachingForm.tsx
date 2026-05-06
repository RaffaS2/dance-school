"use client";

import { useEffect, useState } from "react";

export default function NovoCoachingForm({ prof, alunos, mods, est, sessao }: any) {
  const utilizador = sessao?.user;
  const tipoUtilizador = utilizador?.id_user_type;

  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedModalidade, setSelectedModalidade] = useState("");
  const [selectedEstudio, setSelectedEstudio] = useState("");

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<any[]>([]);
  const [horariosProfConflito, setHorariosProfConflito] = useState<any[]>([]);
  const [horariosEstudioConflito, setHorariosEstudioConflito] = useState<any[]>([]);

  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  // professor auto
  useEffect(() => {
    if (tipoUtilizador === 2 && utilizador) {
      const profEncontrado = prof.find((p: any) => p.id_user === utilizador.id_user);
      if (profEncontrado) {
        const id = String(profEncontrado.id_professor);
        setSelectedProfessor(id);
        fetchHorarios(id);
      }
    }
  }, [tipoUtilizador, utilizador, prof]);

  // aluno auto
  useEffect(() => {
    if (tipoUtilizador === 3 && utilizador) {
      const aluno = alunos.find((a: any) => a.id_user === utilizador.id_user);
      if (aluno) {
        setSelectedAluno(String(aluno.id_student));
      }
    }
  }, [tipoUtilizador, utilizador, alunos]);

  // atualizar quando muda estúdio
  useEffect(() => {
    if (selectedProfessor) {
      fetchHorarios(selectedProfessor);
    }
  }, [selectedEstudio]);

  const fetchHorarios = async (id: string) => {
    setHorarioSelecionado("");
    setHorariosDisponiveis([]);
    setHorariosProfConflito([]);
    setHorariosEstudioConflito([]);

    if (!id) return;

    try {
      const [avRes, coachRes] = await Promise.all([
        fetch(`http://localhost:3001/api/professors/${id}/availabilities`, {
          credentials: "include",
        }),
        fetch(`http://localhost:3001/api/coachings`, {
          credentials: "include",
        }),
      ]);

      const avData = await avRes.json();
      const coachings = await coachRes.json();

      const livres: any[] = [];
      const conflitoProf: any[] = [];
      const conflitoEstudio: any[] = [];

      avData.forEach((h: any) => {
        const data = h.date?.slice(0, 10);
        const hora = h.start_time.slice(0, 5);

        const conflitoProfessor = coachings.find(
          (c: any) =>
            c.date === data &&
            c.start_time.slice(0, 5) === hora &&
            c.id_professor == id &&
            c.status !== "cancelado"
        );

        const conflitoEstudio = coachings.find(
          (c: any) =>
            c.date === data &&
            c.start_time.slice(0, 5) === hora &&
            c.id_studio == selectedEstudio &&
            c.status !== "cancelado"
        );

        if (conflitoProfessor) {
          conflitoProf.push(h);
        } else if (conflitoEstudio) {
          conflitoEstudio.push(h);
        } else {
          livres.push(h);
        }
      });

      setHorariosDisponiveis(livres);
      setHorariosProfConflito(conflitoProf);
      setHorariosEstudioConflito(conflitoEstudio);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfessorChange = async (id: string) => {
    setSelectedProfessor(id);
    fetchHorarios(id);
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
      const res = await fetch("http://localhost:3001/api/coachings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      await fetch("http://localhost:3001/api/studentCoachings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_student: selectedAluno,
          id_coaching: data.id_coaching,
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

      {/* Professor */}
      <select
        className="w-full mb-3 p-2 border rounded"
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

      {/* Aluno */}
      <select
        className="w-full mb-3 p-2 border rounded"
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

      {/* HORÁRIOS */}
      {selectedProfessor && (
        <div className="mb-4">
          <p className="mb-2 font-medium">Horários disponíveis:</p>

          <div className="flex gap-2 flex-wrap mb-3">
            {horariosDisponiveis.length === 0 ? (
              <p className="text-sm text-gray-400">Sem horários disponíveis.</p>
            ) : (
              horariosDisponiveis.map((h: any) => {
                const data = h.date?.slice(0, 10);
                const hora = h.start_time.slice(0, 5);
                const valor = `${data} ${hora}`;

                return (
                  <button
                    key={valor}
                    onClick={() => setHorarioSelecionado(valor)}
                    className={`px-3 py-1 rounded ${
                      horarioSelecionado === valor
                        ? "bg-black text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {data} - {hora}
                  </button>
                );
              })
            )}
          </div>

          {/* Conflito Professor */}
          {horariosProfConflito.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-red-600 font-medium">
                Horários indisponíveis por conflito com o professor:
              </p>
              <div className="flex gap-2 flex-wrap">
                {horariosProfConflito.map((h: any) => {
                  const data = h.date?.slice(0, 10);
                  const hora = h.start_time.slice(0, 5);
                  return (
                    <span key={data + hora} className="bg-red-200 px-2 py-1 text-xs rounded">
                      {data} - {hora}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conflito Estúdio */}
          {horariosEstudioConflito.length > 0 && (
            <div>
              <p className="text-sm text-orange-600 font-medium">
                Horários indisponíveis por conflito de estúdio:
              </p>
              <div className="flex gap-2 flex-wrap">
                {horariosEstudioConflito.map((h: any) => {
                  const data = h.date?.slice(0, 10);
                  const hora = h.start_time.slice(0, 5);
                  return (
                    <span key={data + hora} className="bg-orange-200 px-2 py-1 text-xs rounded">
                      {data} - {hora}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
      >
        Confirmar
      </button>
    </div>
  );
}