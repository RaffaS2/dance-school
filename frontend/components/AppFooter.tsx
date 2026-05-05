/*
 AppFooter.tsx

 Componente de rodapé partilhado para a aplicação. Mostra links úteis e
 informação de copyright e é usado pelo `AppShell` para aparecer em todas
 as páginas. Mantém o código em inglês; o comentário está em português.
*/

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 text-sm">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-center md:text-left">
            <div className="font-medium text-slate-50">Ent&apos;Artes</div>
            <div className="text-slate-300 text-sm">Rua das Artes 123, 1000-000 Lisboa</div>
          </div>

          <div className="text-center">
            <div className="text-slate-100">Contacto: +351 912 345 678</div>
            <div className="text-slate-100">Email: info@entartes.example</div>
          </div>

          <div className="text-center md:text-right text-slate-300">© {year} Ent&apos;Artes</div>
        </div>
      </div>
    </footer>
  );
}
