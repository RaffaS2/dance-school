import NovoCoachingForm from "./NovoCoachingForm";
import { cookies } from "next/headers";

async function getData() {

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers: HeadersInit = token ? { Cookie: `token=${token}` } : {};

  const sessao = await fetch("http://localhost:3001/api/auth/me", { cache: "no-store", headers })
    .then(r => r.ok ? r.json() : null);

  const tipoUtilizador = sessao?.user?.id_user_type;

  const alunosPromise = tipoUtilizador === 3
    ? fetch("http://localhost:3001/api/students/me", { cache: "no-store", headers })
        .then(r => r.ok ? r.json().then(d => [d]) : [])
    : fetch("http://localhost:3001/api/students", { cache: "no-store", headers })
        .then(r => r.json());

  const [prof, alunos, mods, est] = await Promise.all([
    fetch("http://localhost:3001/api/professors", { cache: "no-store", headers }).then(r => r.json()),
    alunosPromise,
    fetch("http://localhost:3001/api/modalities", { cache: "no-store", headers }).then(r => r.json()),
    fetch("http://localhost:3001/api/studios", { cache: "no-store", headers }).then(r => r.json()),
  ]);

  return { prof, alunos, mods, est, sessao };
}

export default async function Page() {
  const data = await getData();

  console.log("SESSAO:", JSON.stringify(data.sessao, null, 2));
  console.log("PROF:", JSON.stringify(data.prof, null, 2));
  console.log("ALUNOS:", JSON.stringify(data.alunos, null, 2));
  console.log("MODS:", JSON.stringify(data.mods, null, 2));
  console.log("EST:", JSON.stringify(data.est, null, 2));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Conteúdo */}
      <div className="flex justify-center p-6">
        <NovoCoachingForm {...data} />
      </div>
    </div>
  );
}
