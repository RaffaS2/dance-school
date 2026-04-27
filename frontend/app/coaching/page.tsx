import Image from "next/image";
import Link from "next/link";

async function getCoachings() {
  try {
    const res = await fetch("http://localhost:3001/api/coachings", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Erro ao buscar coachings");

    return await res.json();
  } catch (err) {
    return [];
  }
}

export default async function CoachingPage() {
  const coachings = await getCoachings();

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
          <h1 className="text-xl font-bold">Coachings</h1>
        </div>

        <div className="flex gap-3">
          <Link href="/">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Página Inicial
            </button>
          </Link>

          <Link href="/coaching/novo">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              + Requisitar Coaching
            </button>
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="p-6">
        <div className="grid gap-4">

          {coachings.length === 0 ? (
            <p>Sem coachings disponíveis.</p>
          ) : (
            coachings.map((c: any) => (
              <div key={c.id_coaching} className="bg-white p-4 rounded-xl shadow">

                <p className="font-semibold">
                  {c.modalidade} - {c.estudio}
                </p>

                <p className="text-gray-600">
                  Professor: {c.professor}
                </p>

                <p className="text-gray-500 text-sm">
                  Data: {c.date?.split("T")[0]}
                </p>

                <p className="text-gray-500 text-sm">
                  Hora: {c.start_time}
                </p>

                <p className="text-gray-500 text-sm">
                  Duração: {c.duration_minutes} min
                </p>

                <p className="text-gray-500 text-sm">
                  Estado: {c.status}
                </p>

                <p className="text-gray-500 text-sm">
                  Preço: {c.price}€
                </p>

              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}