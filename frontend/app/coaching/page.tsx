<<<<<<< HEAD
=======
import Image from "next/image";
>>>>>>> main
import Link from "next/link";

export default function CoachingPage() {
  const coachings = [
    {
      id: 1,
      aluno: "Ana",
      professor: "Maria",
      data: "2026-04-10",
      hora: "14:00",
    },
    {
      id: 2,
      aluno: "Pedro",
      professor: "João",
      data: "2026-04-11",
      hora: "09:00",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow mb-6">
        <div className="flex items-center gap-4">
<<<<<<< HEAD
          <img
            src="/logo.png"
            alt="Ent'Artes Logo"
            className="h-12 object-contain"
=======
          <Image
            src="/logo.png"
            alt="Ent'Artes Logo"
            width={144}
            height={48}
            className="h-12 w-auto object-contain"
>>>>>>> main
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
          {coachings.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <p className="font-semibold">Aluno: {c.aluno}</p>
              <p className="text-gray-600">Professor: {c.professor}</p>
              <p className="text-gray-500 text-sm">
                Data: {c.data}
              </p>
              <p className="text-gray-500 text-sm">
                Hora: {c.hora}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}