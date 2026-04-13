import Link from "next/link";
import "./globals.css";

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
    <div className="container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo-container">
          <img src="/logo.png" alt="Ent'Artes Logo" className="logo-large" />
        </div>
        <nav>
          <Link href="/login"><button className="btn-outline">Login</button></Link>
          <Link href="/register"><button className="btn-primary">Registar</button></Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <img src="/logo.png" alt="Ent'Artes Logo" className="hero-logo" />
        <h2>Bem-vindo à Ent'Artes</h2>
        <p>
          Escola de dança dedicada ao desenvolvimento artístico e pessoal.
        </p>
        <Link href="/dashboard">
          <button className="btn-main">Entrar</button>
        </Link>
      </section>

      {/* Features */}
      <section className="features">
        <div className="card">
          <h3>Coaching</h3>
          <p>Gestão de sessões de coaching.</p>
          <Link href="/coaching">
            <button className="btn-blue">Ir para Coaching</button>
          </Link>
        </div>

        <div className="card">
          <h3>Inventário</h3>
          <p>Controle de itens e requisições.</p>
          <Link href="/inventario">
            <button className="btn-green">Ir para Inventário</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Ent'Artes
      </footer>
    </div>
  );
}
