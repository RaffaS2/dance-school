import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { id: 1, titulo: "Utilizadores Ativos", valor: 128 },
    { id: 2, titulo: "Aulas Marcadas", valor: 42 },
    { id: 3, titulo: "Professores Disponíveis", valor: 12 },
  ];

  const proximasAulas = [
    { id: 1, nome: "Ballet", data: "2026-04-16", hora: "10:00" },
    { id: 2, nome: "Dança Oriental", data: "2026-04-16", hora: "14:00" },
    { id: 3, nome: "Jazz", data: "2026-04-17", hora: "09:30" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow mb-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Ent'Artes Logo"
            className="h-12 object-contain"
          />
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        <div className="flex gap-3">
          <Link href="/">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Página Inicial
            </button>
          </Link>

          <Link href="/coaching">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Ver Coachings
            </button>
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="p-6">
        {/* Cards principais */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-xl shadow">
              <h3 className="text-lg font-semibold">{s.titulo}</h3>
              <p className="text-3xl font-bold mt-2">{s.valor}</p>
            </div>
          ))}
        </div>

        {/* Próximas aulas */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Próximas Aulas</h2>
          <div className="space-y-3">
            {proximasAulas.map((aula) => (
              <div
                key={aula.id}
                className="p-3 rounded-lg border border-gray-300"
              >
                <p className="font-semibold">{aula.nome}</p>
                <p className="text-gray-600 text-sm">
                  {aula.data} às {aula.hora}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
