import NovaDisponibilidadeForm from "./NovaDisponibilidadeForm";

async function getProfessores() {
  try {
    const res = await fetch("http://localhost:3001/professors", {
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    return [];
  }
}

export default async function Page() {
  const professores = await getProfessores();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Conteúdo */}
      <div className="flex justify-center p-6">
        <NovaDisponibilidadeForm professores={professores} />
      </div>
    </div>
  );
}