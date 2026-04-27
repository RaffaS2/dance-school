"use client";

import Link from "next/link";
import { useMemo } from "react";

type AulaEstado = "pendente" | "validado-professor" | "concluida";

type Aula = {
  id: number;
  titulo: string;
  modalidade: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  sala: string;
  professor: string;
  preco: number;
  estado: AulaEstado;
};

type Fatura = {
  id: number;
  descricao: string;
  valor: number;
  estado: "pendente" | "pago";
  dataLimite: string;
};

type Validacao = {
  id: number;
  tipo: "Aula" | "Inscrição";
  descricao: string;
  estado: "aguarda-aprovacao" | "aprovado";
};

const utilizadorAtual = "João Silva";

const aulasMock: Aula[] = [
  {
    id: 1,
    titulo: "Ballet Individual",
    modalidade: "Ballet Clássico",
    data: "10 de março, 2026",
    horaInicio: "10:00",
    horaFim: "11:00",
    sala: "Sala A - Ballet",
    professor: "Maria Santos",
    preco: 25,
    estado: "pendente",
  },
  {
    id: 2,
    titulo: "Hip-Hop em Grupo",
    modalidade: "Hip-Hop",
    data: "12 de março, 2026",
    horaInicio: "18:00",
    horaFim: "19:30",
    sala: "Estúdio 2 - Urbano",
    professor: "Carlos Ribeiro",
    preco: 15,
    estado: "validado-professor",
  },
  {
    id: 3,
    titulo: "Contemporâneo Intermédio",
    modalidade: "Contemporâneo",
    data: "15 de março, 2026",
    horaInicio: "19:00",
    horaFim: "20:00",
    sala: "Sala C - Contemporâneo",
    professor: "Ana Costa",
    preco: 20,
    estado: "validado-professor",
  },
];

const faturasMock: Fatura[] = [
  {
    id: 101,
    descricao: "Mensalidade - Março 2026",
    valor: 30,
    estado: "pendente",
    dataLimite: "05/03/2026",
  },
  {
    id: 102,
    descricao: "Aula Individual - Ballet",
    valor: 10,
    estado: "pendente",
    dataLimite: "08/03/2026",
  },
  {
    id: 103,
    descricao: "Mensalidade - Fevereiro 2026",
    valor: 30,
    estado: "pago",
    dataLimite: "05/02/2026",
  },
];

const validacoesMock: Validacao[] = [
  {
    id: 201,
    tipo: "Aula",
    descricao: "Validação de aula individual de Ballet",
    estado: "aguarda-aprovacao",
  },
];

function estadoAulaLabel(estado: AulaEstado) {
  if (estado === "pendente") return "Pendente";
  if (estado === "validado-professor") return "Validado Professor";
  return "Concluída";
}

function estadoAulaBadgeColor(estado: AulaEstado) {
  if (estado === "pendente") return "bg-yellow-100 text-yellow-800";
  if (estado === "validado-professor") return "bg-emerald-100 text-emerald-800";
  return "bg-gray-200 text-gray-800";
}

export default function DashboardPage() {
  const proximasAulas = useMemo(() => aulasMock.slice(0, 3), []);
  const validacoesPendentes = useMemo(
    () => validacoesMock.filter((v) => v.estado === "aguarda-aprovacao"),
    [],
  );
  const faturasPendentes = useMemo(
    () => faturasMock.filter((f) => f.estado === "pendente"),
    [],
  );

  const totalPagamentosPendentes = useMemo(
    () => faturasPendentes.reduce((acc, f) => acc + f.valor, 0),
    [faturasPendentes],
  );

  return (
    <div className="min-h-screen bg-gray-100 text-zinc-900">
      {/* HEADER */}
      <header className="mb-6 bg-white px-6 py-4 shadow">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Escola de Dança
            </p>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Bem-vindo, <span className="font-semibold">{utilizadorAtual}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/modalidades">
              <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900">
                Ver Modalidades
              </button>
            </Link>
            <Link href="/inventario">
              <button className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600">
                Inventário
              </button>
            </Link>
            <Link href="/perfil">
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                Perfil
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-10">
        {/* CARDS RESUMO */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Próximas Aulas
            </p>
            <p className="mt-2 text-2xl font-bold">{proximasAulas.length}</p>
            <p className="text-sm text-gray-600">Aulas agendadas</p>
            <Link
              href="/minhas-aulas"
              className="mt-3 inline-block text-xs font-semibold text-gray-700 underline underline-offset-4"
            >
              Ver todas as aulas
            </Link>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Validações Pendentes
            </p>
            <p className="mt-2 text-2xl font-bold">{validacoesPendentes.length}</p>
            <p className="text-sm text-gray-600">Aguardando aprovação</p>
            <Link
              href="/minhas-aulas"
              className="mt-3 inline-block text-xs font-semibold text-gray-700 underline underline-offset-4"
            >
              Ver detalhes
            </Link>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pagamentos Pendentes
            </p>
            <p className="mt-2 text-2xl font-bold">
              {totalPagamentosPendentes.toFixed(2)}€
            </p>
            <p className="text-sm text-gray-600">
              {faturasPendentes.length} fatura(s) por pagar
            </p>
            <Link
              href="/faturas"
              className="mt-3 inline-block text-xs font-semibold text-gray-700 underline underline-offset-4"
            >
              Ir para Faturas
            </Link>
          </div>
        </section>

        {/* CALL-TO-ACTIONS (MODALIDADES / ESTÚDIOS) */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-blue-50 p-5 shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              📘
            </div>
            <h2 className="text-base font-semibold">Consultar Modalidades</h2>
            <p className="mt-1 text-sm text-blue-900/80">
              Descubra as modalidades disponíveis e encontre a aula ideal para si.
            </p>
            <Link href="/modalidades">
              <button className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                Ver Modalidades
              </button>
            </Link>
          </div>

          <div className="rounded-xl bg-purple-50 p-5 shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              🏢
            </div>
            <h2 className="text-base font-semibold">Selecionar Estúdio</h2>
            <p className="mt-1 text-sm text-purple-900/80">
              Escolha um estúdio para as suas aulas e acompanhe a disponibilidade.
            </p>
            <Link href="/estudios">
              <button className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                Ver Estúdios
              </button>
            </Link>
          </div>
        </section>

        {/* PRÓXIMAS AULAS + PAGAMENTOS PENDENTES */}
        <section className="grid gap-4 lg:grid-cols-3">
          {/* Próximas Aulas */}
          <div className="lg:col-span-2 rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Próximas Aulas</h2>
              <Link
                href="/minhas-aulas"
                className="text-xs font-semibold text-gray-700 underline underline-offset-4"
              >
                Ver todas
              </Link>
            </div>

            {proximasAulas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                Não tem aulas agendadas neste momento.
              </div>
            ) : (
              <div className="space-y-3">
                {proximasAulas.map((aula) => (
                  <article
                    key={aula.id}
                    className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">{aula.titulo}</h3>
                        <p className="text-xs text-gray-500">
                          {aula.modalidade} • {aula.professor}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {aula.data} • {aula.horaInicio} - {aula.horaFim}
                        </p>
                        <p className="text-xs text-gray-500">{aula.sala}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoAulaBadgeColor(
                            aula.estado,
                          )}`}
                        >
                          {estadoAulaLabel(aula.estado)}
                        </span>
                        <p className="text-sm font-semibold">{aula.preco.toFixed(2)}€</p>
                        <button className="text-xs font-semibold text-gray-700 underline underline-offset-4">
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Pagamentos Pendentes */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pagamentos Pendentes</h2>
              <Link
                href="/faturas"
                className="text-xs font-semibold text-gray-700 underline underline-offset-4"
              >
                Ver faturas
              </Link>
            </div>

            {faturasPendentes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                Não tem pagamentos pendentes.
              </div>
            ) : (
              <div className="space-y-3">
                {faturasPendentes.map((fatura) => (
                  <div
                    key={fatura.id}
                    className="flex items-start justify-between rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-semibold">{fatura.descricao}</p>
                      <p className="text-xs text-gray-500">
                        Data limite: {fatura.dataLimite}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {fatura.valor.toFixed(2)}€
                      </p>
                      <button className="mt-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-black">
                        Pagar agora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
