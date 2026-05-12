import NovoCoachingForm from "./NovoCoachingForm";
import { cookies } from "next/headers";
import { getApiBase } from "../../lib/apiBase";

async function getData() {
  const apiBase = getApiBase();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers: HeadersInit = token
    ? { Cookie: `token=${token}` }
    : {};

  const sessao = await fetch(`${apiBase}/auth/me`, {
    cache: "no-store",
    headers,
  }).then((r) => (r.ok ? r.json() : null));

  const tipoUtilizador = sessao?.user?.id_user_type;

  const alunosPromise =
    tipoUtilizador === 3
      ? fetch(`${apiBase}/students/me`, {
          cache: "no-store",
          headers,
        }).then((r) => (r.ok ? r.json().then((d) => [d]) : []))
      : fetch(`${apiBase}/students`, {
          cache: "no-store",
          headers,
        }).then((r) => r.json());

  const [prof, alunos, mods, est] = await Promise.all([
    fetch(`${apiBase}/professors`, {
      cache: "no-store",
      headers,
    }).then((r) => r.json()),

    alunosPromise,

    fetch(`${apiBase}/modalities`, {
      cache: "no-store",
      headers,
    }).then((r) => r.json()),

    fetch(`${apiBase}/studios`, {
      cache: "no-store",
      headers,
    }).then((r) => r.json()),
  ]);

  return { prof, alunos, mods, est, sessao };
}

export default async function Page() {
  const data = await getData();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center p-6">
        <NovoCoachingForm {...data} />
      </div>
    </div>
  );
}