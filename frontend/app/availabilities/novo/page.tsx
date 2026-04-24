import NovaDisponibilidadeForm from "./NovaDisponibilidadeForm";
import Link from "next/link";

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
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow mb-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Ent'Artes Logo"
            className="h-10 object-contain"
          />
          <h1 className="text-xl font-bold">Nova Disponibilidade</h1>
        </div>

        <Link href="/availabilities">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
            Voltar
          </button>
        </Link>
      </header>

      {/* Conteúdo */}
      <div className="flex justify-center p-6">
        <NovaDisponibilidadeForm professores={professores} />
      </div>
    </div>
  );
}