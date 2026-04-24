import Image from "next/image";
import Link from "next/link";

async function getData() {
  try {
    const res = await fetch("http://localhost:3001", { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao buscar dados");
    return await res.json();
  } catch (err) {
    return { message: "Backend offline" };
  }
}

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Ent'Artes Logo"
            width={144}
            height={48}
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Botão Voltar */}
        <Link href="/">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
            Pagina Inicial
          </button>
        </Link>
      </header>

      {/* Conteúdo */}
      <div className="p-6">
        <h2 className="text-3xl font-semibold mb-2">
          TESTE
        </h2>
      </div>

    </div>
  );
}