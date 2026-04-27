import Image from "next/image";
import Link from "next/link";

async function getAvailabilities() {
  try {
    const res = await fetch("http://localhost:3001/availabilities", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Erro ao buscar disponibilidades");

    return await res.json();
  } catch (err) {
    return [];
  }
}

export default async function AvailabilitiesPage() {
  const availabilities = await getAvailabilities();

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow mb-6">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Ent'Artes Logo"
            width={144}
            height={48}
            className="h-12 w-auto object-contain"
          />
          <h1 className="text-xl font-bold">Disponibilidades</h1>
        </div>

        <div className="flex gap-3">

          <Link href="/availabilities/novo">
        <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
          + Marcar Disponibilidade
        </button>
          </Link>
          <Link href="/">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Página Inicial
            </button>
          </Link>
        </div>

      </header>

      {/* Conteúdo */}
      <div className="p-6">
        <div className="grid gap-4">

          {availabilities.length === 0 ? (
            <p>Sem disponibilidades.</p>
          ) : (
            availabilities.map((a: any) => (
              <div key={a.id_availability} className="bg-white p-4 rounded-xl shadow">

                <p className="font-semibold">
                  Professor: {a.professor}
                </p>

                <p className="text-gray-600">
                    Dia: {new Date(a.date).toLocaleDateString("pt-PT")}
                </p>

                <p className="text-gray-500 text-sm">
                  Hora Início: {a.start_time}
                </p>

                <p className="text-gray-500 text-sm">
                  Hora Fim: {a.end_time}
                </p>

              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}