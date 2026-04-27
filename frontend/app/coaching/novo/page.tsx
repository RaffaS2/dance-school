import NovoCoachingForm from "./NovoCoachingForm";
import Link from "next/link";
import { cookies } from "next/headers";

async function getData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers: HeadersInit = token ? { Cookie: `token=${token}` } : {};

  const [prof, alunos, mods, est, sessao] = await Promise.all([
    fetch("http://localhost:3001/professors", { cache: "no-store" }).then(r => r.json()),
    fetch("http://localhost:3001/students", { cache: "no-store" }).then(r => r.json()),
    fetch("http://localhost:3001/modalities", { cache: "no-store" }).then(r => r.json()),
    fetch("http://localhost:3001/studios", { cache: "no-store" }).then(r => r.json()),
    fetch("http://localhost:3001/api/auth/me", { cache: "no-store", headers }).then(r => r.ok ? r.json() : null),
  ]);

  return { prof, alunos, mods, est, sessao };
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