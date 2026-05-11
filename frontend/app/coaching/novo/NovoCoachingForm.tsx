"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:3001";

export default function NovoCoachingForm() {
  const [sessao, setSessao] = useState<any>(null);
  const [prof, setProf] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [mods, setMods] = useState<any[]>([]);
  const [est, setEst] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([""]);
  const [selectedModalidade, setSelectedModalidade] = useState("");
  const [selectedEstudio, setSelectedEstudio] = useState("");
  const [horarios, setHorarios] = useState<any[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Carregar sessão e dados iniciais
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Sessão
        const sessaoRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        if (!sessaoRes.ok) { setLoading(false); return; }
        const sessaoData = await sessaoRes.json();
        const user = sessaoData.user;
        setSessao(user);

        const tipo = user.id_user_type;

        // 2. Dados em paralelo
        const [profRes, modsRes, estRes] = await Promise.all([
          fetch(`${API}/professors`, { credentials: "include" }).then(r => r.ok ? r.json() : []),
          fetch(`${API}/modalities`, { credentials: "include" }).then(r => r.ok ? r.json() : []),
          fetch(`${API}/studios`, { credentials: "include" }).then(r => r.ok ? r.json() : []),
        ]);

        setProf(Array.isArray(profRes) ? profRes : []);
        setMods(Array.isArray(modsRes) ? modsRes : []);
        setEst(Array.isArray(estRes) ? estRes : []);

        // 3. Alunos — depende do tipo
        if (tipo === 3) {
          const meRes = await fetch(`${API}/students/me`, { credentials: "include" });
          if (meRes.ok) {
            const me = await meRes.json();
            setAlunos([me]);
            if (me?.id_student) setSelectedAlunos([String(me.id_student)]);
          }
        } else {
          const alunosRes = await fetch(`${API}/students`, { credentials: "include" });
          setAlunos(alunosRes.ok ? await alunosRes.json() : []);
        }

        // 4. Pré-selecionar professor se for tipo 2
        if (tipo === 2) {
          const profEncontrado = (Array.isArray(profRes) ? profRes : []).find((p: any) => p.id_user === user.id_user);
          if (profEncontrado) {
            const id = String(profEncontrado.id_professor);
            setSelectedProfessor(id);
            await fetchHorarios(id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  const fetchHorarios = async (id: string) => {
    setHorarios([]);
    setHorarioSelecionado("");
    if (!id) return;
    try {
      const res = await fetch(`${API}/availabilities/professor/${id}`, { credentials: "include" });
      const data = await res.json();
      setHorarios(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
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
    if (selectedAlunos.length < 4) setSelectedAlunos([...selectedAlunos, ""]);
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
      const res = await fetch(`${API}/coachings`, {
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
        const scRes = await fetch(`${API}/studentCoachings`, {
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
      if (sessao?.id_user_type === 3) {
        setSelectedAlunos([alunosValidos[0]]);
      } else {
        setSelectedAlunos([""]);
      }
      void fetchHorarios(selectedProfessor);
    } catch {
      setErro("Erro de ligação ao servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white rounded shadow text-sm text-gray-400">
        A carregar...
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white rounded shadow text-sm text-rose-600">
        Sessão não encontrada. Faz login para continuar.
      </div>
    );
  }

  const tipoUtilizador = sessao.id_user_type;

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
        {prof.map((p: any) => (
          <option key={p.id_professor} value={p.id_professor}>{p.name}</option>
        ))}
      </select>

      {/* Alunos — até 4 */}
      <div className="mb-3">
        {selectedAlunos.map((alunoId, index) => {
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
                {alunos
                  .filter((a: any) =>
                    String(a.id_student) === alunoId ||
                    !alunosSelecionados.includes(String(a.id_student))
                  )
                  .map((a: any) => (
                    <option key={a.id_student} value={a.id_student}>{a.name}</option>
                  ))}
              </select>

              {selectedAlunos.length > 1 && !isLocked && (
                <button
                  onClick={() => removerAluno(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-lg leading-none"
                >−</button>
              )}
            </div>
          );
        })}

        {selectedAlunos.length < 4 && (
          <button onClick={adicionarAluno} className="mt-1 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
            <span className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-base leading-none">+</span>
            Adicionar aluno
          </button>
        )}
      </div>

      {/* Modalidade */}
      <select className="w-full mb-3 p-2 border rounded" value={selectedModalidade} onChange={(e) => setSelectedModalidade(e.target.value)}>
        <option value="">Selecionar Modalidade</option>
        {mods.map((m: any) => (
          <option key={m.id_modality} value={m.id_modality}>{m.name}</option>
        ))}
      </select>

      {/* Estúdio */}
      <select className="w-full mb-3 p-2 border rounded" value={selectedEstudio} onChange={(e) => setSelectedEstudio(e.target.value)}>
        <option value="">Selecionar Estúdio</option>
        {est.map((e: any) => (
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
                    className={`px-3 py-1 rounded ${horarioSelecionado === valor ? "bg-black text-white" : "bg-gray-400 text-white"}`}
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