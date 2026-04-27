import NovoCoachingForm from "./NovoCoachingForm";
import Link from "next/link";

async function getData() {
  const [prof, alunos, mods, est] = await Promise.all([
    fetch("http://localhost:3001/api/professors", { cache: "no-store" }).then(r => r.json()),
    fetch("http://localhost:3001/api/students", { cache: "no-store" }).then(r => r.json()),
    fetch("http://localhost:3001/api/modalities", { cache: "no-store" }).then(r => r.json()),
    fetch("http://localhost:3001/api/studios", { cache: "no-store" }).then(r => r.json()),
  ]);

  return { prof, alunos, mods, est };
}

export default async function Page() {
  const data = await getData();

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
          <h1 className="text-xl font-bold">Requisitar Coaching</h1>
        </div>

        <Link href="/coaching">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
            Voltar
          </button>
        </Link>
      </header>

      {/* Conteúdo */}
      <div className="flex justify-center p-6">
        <NovoCoachingForm {...data} />
      </div>
    </div>
  );
}