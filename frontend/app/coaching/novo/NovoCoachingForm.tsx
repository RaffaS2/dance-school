"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "../../lib/apiBase";

export default function NovoCoachingForm({ prof, alunos, mods, est, sessao }: any) {
  const apiBase = getApiBase();
  const utilizador = sessao?.user;
  const tipoUtilizador = utilizador?.id_user_type; // 1=admin, 2=professor, 3=aluno/encarregado

  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([""]);
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

  // Pré-selecionar primeiro aluno se o utilizador for aluno/encarregado
  // /students/me devolve um único objeto, por isso o array tem só 1 elemento
  useEffect(() => {
    if (tipoUtilizador === 3) {
      const alunosArray = Array.isArray(alunos) ? alunos : [];
      // Tentar pelo id_user; se não encontrar (estrutura diferente), usar o 1º elemento
      const alunoEncontrado =
        alunosArray.find((a: any) => a.id_user === utilizador?.id_user) ?? alunosArray[0];
      if (alunoEncontrado?.id_student) {
        setSelectedAlunos([String(alunoEncontrado.id_student)]);
      }
    }
  }, [tipoUtilizador, utilizador, alunos]);

  const fetchHorarios = async (id: string) => {
    setHorarios([]);
    setHorarioSelecionado("");
    if (!id) return;
    try {
      const res = await fetch(`${apiBase}/availabilities/professor/${id}`, { credentials: "include" });
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

  const handleAlunoChange = (index: number, value: string) => {
    const updated = [...selectedAlunos];
    updated[index] = value;
    setSelectedAlunos(updated);
  };

  const adicionarAluno = () => {
    if (selectedAlunos.length < 4) {
      setSelectedAlunos([...selectedAlunos, ""]);
    }
  };

  const removerAluno = (index: number) => {
    if (selectedAlunos.length === 1) return;
    setSelectedAlunos(selectedAlunos.filter((_, i) => i !== index));
  };

  const alunosSelecionados = selectedAlunos.filter(Boolean);

  const handleSubmit = async () => {
    setErro("");
    setSucesso(false);

    const alunosValidos = selectedAlunos.filter(Boolean);

    if (!selectedProfessor || alunosValidos.length === 0 || !selectedModalidade || !selectedEstudio || !horarioSelecionado) {
      setErro("Preenche todos os campos antes de confirmar.");
      return;
    }

    const unique = new Set(alunosValidos);
    if (unique.size !== alunosValidos.length) {
      setErro("Não podes selecionar o mesmo aluno mais do que uma vez.");
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

      for (const id_student of alunosValidos) {
        const scRes = await fetch(`${apiBase}/studentCoachings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id_student, id_coaching: coaching.id_coaching }),
        });

        if (!scRes.ok) {
          setErro("Coaching criado mas falhou ao associar um dos alunos.");
          return;
        }
      }

      setSucesso(true);
      setHorarioSelecionado("");
      setSelectedModalidade("");
      setSelectedEstudio("");
      // Tipo 3: manter o primeiro aluno pré-selecionado, limpar os extras
      if (tipoUtilizador === 3) {
        setSelectedAlunos([alunosValidos[0]]);
      } else {
        setSelectedAlunos([""]);
      }
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

      {erro && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {erro}
        </div>
      )}

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
          <option key={p.id_professor} value={p.id_professor}>{p.name}</option>
        ))}
      </select>

      {/* Alunos — até 4 */}
      <div className="mb-3">
        {selectedAlunos.map((alunoId, index) => {
          // Para tipo 3, o primeiro aluno está bloqueado (pré-selecionado)
          const isLocked = tipoUtilizador === 3 && index === 0;

          return (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <select
                className="flex-1 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                value={alunoId}
                disabled={isLocked}
                onChange={(e) => handleAlunoChange(index, e.target.value)}
              >
                <option value="">Selecionar Aluno</option>
                {alunosArray
                  .filter((a: any) =>
                    String(a.id_student) === alunoId ||
                    !alunosSelecionados.includes(String(a.id_student))
                  )
                  .map((a: any) => (
                    <option key={a.id_student} value={a.id_student}>{a.name}</option>
                  ))}
              </select>

              {/* Botão remover — não no primeiro aluno bloqueado, nem se só houver 1 linha */}
              {selectedAlunos.length > 1 && !isLocked && (
                <button
                  onClick={() => removerAluno(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-lg leading-none"
                  title="Remover aluno"
                >
                  −
                </button>
              )}
            </div>
          );
        })}

        {/* Botão adicionar aluno — disponível para todos enquanto < 4 */}
        {tipoUtilizador !== 3 && selectedAlunos.length < 4 && (
  <button
    onClick={adicionarAluno}
    className="mt-1 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
  >
    <span className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:border-gray-500 text-base leading-none">
      +
    </span>
    Adicionar aluno
  </button>
)}
      </div>

      {/* Modalidade */}
      <select
        className="w-full mb-3 p-2 border rounded"
        value={selectedModalidade}
        onChange={(e) => setSelectedModalidade(e.target.value)}
      >
        <option value="">Selecionar Modalidade</option>
        {modsArray.map((m: any) => (
          <option key={m.id_modality} value={m.id_modality}>{m.name}</option>
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
          <option key={e.id_studio} value={e.id_studio}>{e.name}</option>
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
                      horarioSelecionado === valor ? "bg-black text-white" : "bg-gray-400 text-white"
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