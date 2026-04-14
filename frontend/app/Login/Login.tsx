// frontend/app/Login/Login.tsx
import Link from 'next/link'
import EntArtesLogo from '../Images/EntArtesLogo.png'

export default function Login() {
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
      <div className="text-center -mt-16 mb-0.5 relative z-10">
        <img
          src={EntArtesLogo.src}
          className="mx-auto block drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)]"
          width={380}
          height={380}
          alt="EntArtes Logo"
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-[360px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#f0f0f0] rounded-xl px-8 py-10">

        <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">
          Bem-vindo/a
        </h2>
        <p className="text-[13px] text-[#7a7a7a] mb-8">
          Acede à tua conta para continuar
        </p>

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

        {/* Password */}
        <div className="mb-1.5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">
            Palavra-passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        <a href="#" className="block text-[12px] text-[#D4537E] hover:underline mb-0 mt-1">
          Esqueceste a palavra-passe?
        </a>

        <button className="w-full py-3.5 mt-6 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] border-none rounded-md text-white text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
          Entrar
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2.5 w-full my-6">
          <div className="flex-1 h-px bg-[#eeeeee]" />
          <span className="text-[#bbbbbb] text-xs">ou</span>
          <div className="flex-1 h-px bg-[#eeeeee]" />
        </div>

        <p className="text-sm text-[#7a7a7a]">
          Ainda não tens conta?{' '}
          <Link href="/register" className="text-[#D4537E] font-medium no-underline hover:underline">
            Regista-te aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
