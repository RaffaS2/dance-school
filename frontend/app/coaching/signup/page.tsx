import Link from 'next/link'

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-['Jost',sans-serif] bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f7f3f9_100%)]">

      {/* Círculos decorativos */}
      <div
        className="absolute rounded-full border border-[rgba(212,83,126,0.08)] pointer-events-none"
        style={{ width: 600, height: 600, top: -200, left: -200, background: 'rgba(212, 83, 126, 0.03)' }}
      />
      <div
        className="absolute rounded-full border border-[rgba(212,83,126,0.08)] pointer-events-none"
        style={{ width: 400, height: 400, bottom: -150, right: -150, background: 'rgba(127, 119, 221, 0.03)' }}
      />

      {/* Logo */}
      <div className="text-center -mt-8 mb-0.5 relative z-10">
        <img
          src="/Logo.png"
          className="mx-auto block drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)]"
          width={280}
          height={280}
          alt="EntArtes Logo"
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-[400px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#f0f0f0] rounded-xl px-8 py-10">

        <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">
          Criar conta
        </h2>
        <p className="text-[13px] text-[#7a7a7a] mb-7">
          Junta-te à comunidade EntArtes
        </p>

        {/* Nome e Apelido lado a lado */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">
              Nome
            </label>
            <input
              type="text"
              placeholder="João"
              className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">
              Apelido
            </label>
            <input
              type="text"
              placeholder="Silva"
              className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="o.teu@email.com"
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        {/* Palavra-passe */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">
            Palavra-passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        {/* Confirmar Palavra-passe */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">
            Confirmar Palavra-passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        {/* Termos e condições */}
        <div className="flex items-start gap-2.5 mb-6">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 w-4 h-4 accent-[#D4537E] cursor-pointer shrink-0"
          />
          <label htmlFor="terms" className="text-[12px] text-[#7a7a7a] leading-relaxed cursor-pointer">
            Aceito os{' '}
            <a href="#" className="text-[#D4537E] hover:underline">Termos e Condições</a>
            {' '}e a{' '}
            <a href="#" className="text-[#D4537E] hover:underline">Política de Privacidade</a>
          </label>
        </div>

        <button className="w-full py-3.5 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] border-none rounded-md text-white text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
          Criar Conta
        </button>

        {/* Divisor */}
        <div className="flex items-center justify-center gap-2.5 w-full my-6">
          <div className="flex-1 h-px bg-[#eeeeee]" />
          <span className="text-[#bbbbbb] text-xs">ou</span>
          <div className="flex-1 h-px bg-[#eeeeee]" />
        </div>

        <p className="text-sm text-[#7a7a7a]">
          Já tens conta?{' '}
          <Link href="/login" className="text-[#D4537E] font-medium no-underline hover:underline">
            Inicia sessão aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
