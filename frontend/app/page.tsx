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
          <img src="/logo.png" alt="Ent'Artes Logo" className="h-12 object-contain" />
        </div>
        <nav className="flex gap-3">
          <Link href="/login">
            <button className="border border-black px-4 py-2 rounded-lg hover:bg-gray-100">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              Registar
            </button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-12">
        <img src="/logo.png" alt="Ent'Artes Logo" className="w-72 max-w-full mb-6" />
        <h2 className="text-3xl font-semibold mb-2">Bem-vindo à Ent'Artes</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Escola de dança dedicada ao desenvolvimento artístico e pessoal.
        </p>
        <Link href="/dashboard">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700">
            Entrar
          </button>
        </Link>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 gap-6 p-6">
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Coaching</h3>
          <p className="text-gray-600 mb-4">Gestão de sessões de coaching.</p>
          <Link href="/coaching">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Ir para Coaching
            </button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Inventário</h3>
          <p className="text-gray-600 mb-4">Controle de itens e requisições.</p>
          <Link href="/inventario">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Ir para Inventário
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500">
        © {new Date().getFullYear()} Ent'Artes
      </footer>
    </div>
  );
}