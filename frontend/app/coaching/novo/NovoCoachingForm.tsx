"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "../../lib/apiBase";

export default function NovoCoachingForm({ prof, alunos, mods, est, sessao }: any) {
  const apiBase = getApiBase();
  const utilizador = sessao?.user;
  const tipoUtilizador = utilizador?.id_user_type; // 1=admin, 2=professor, 3=aluno/encarregado

  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedModalidade, setSelectedModalidade] = useState("");
  const [selectedEstudio, setSelectedEstudio] = useState("");
  const [horarios, setHorarios] = useState<any[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pré-selecionar professor se o utilizador for professor
  useEffect(() => {
    if (tipoUtilizador === 2 && utilizador) {
      const profArray = Array.isArray(prof) ? prof : [];
      const profEncontrado = profArray.find((p: any) => p.id_user === utilizador.id_user);
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
      const alunosArray = Array.isArray(alunos) ? alunos : [];
      const alunoEncontrado = alunosArray.find((a: any) => a.id_user === utilizador.id_user);
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
      const res = await fetch(
        `${apiBase}/availabilities/professor/${id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setHorarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfessorChange = async (id: string) => {
    setSelectedProfessor(id);
    await fetchHorarios(id);
  };

  const handleSubmit = async () => {
    setErro("");
    setSucesso(false);

    if (!selectedProfessor || !selectedAluno || !selectedModalidade || !selectedEstudio || !horarioSelecionado) {
      setErro("Preenche todos os campos antes de confirmar.");
      return;
    }

    const [date, time] = horarioSelecionado.split(" ");
    setSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/coachings`, {
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

      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || "Erro ao criar coaching.");
        return;
      }

      const coaching = await res.json();

      const scRes = await fetch(`${apiBase}/studentCoachings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_student: selectedAluno,
          id_coaching: coaching.id_coaching,
        }),
      });

      if (!scRes.ok) {
        setErro("Coaching criado mas falhou ao associar o aluno.");
        return;
      }

      setSucesso(true);
      setHorarioSelecionado("");
      setSelectedModalidade("");
      setSelectedEstudio("");
      // Recarregar horários para remover o slot agora ocupado
      void fetchHorarios(selectedProfessor);
    } catch (error) {
      setErro("Erro de ligação ao servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const profArray = Array.isArray(prof) ? prof : [];
  const alunosArray = Array.isArray(alunos) ? alunos : [];
  const modsArray = Array.isArray(mods) ? mods : [];
  const estArray = Array.isArray(est) ? est : [];

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Novo Coaching</h2>

      {/* Erro */}
      {erro && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {erro}
        </div>
      )}

      {/* Sucesso */}
      {sucesso && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          Coaching criado com sucesso!
        </div>
      )}

      {/* Professor — bloqueado se for professor */}
      <select
        className="w-full mb-3 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        value={selectedProfessor}
        disabled={tipoUtilizador === 2}
        onChange={(e) => handleProfessorChange(e.target.value)}
      >
        <option value="">Selecionar Professor</option>
        {profArray.map((p: any) => (
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
        {alunosArray.map((a: any) => (
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
        {modsArray.map((m: any) => (
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
        {estArray.map((e: any) => (
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
                const data = h.date?.slice(0, 10);
                const hora = h.start_time.slice(0, 5);
                const valor = `${data} ${hora}`;
                return (
                  <button
                    key={h.id_availability}
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
        disabled={submitting}
        className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "A criar..." : "Confirmar"}
      </button>
    </div>
  );
}