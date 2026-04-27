'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getApiBase } from '../lib/apiBase'

export default function Login() {
  const router = useRouter()
  const apiBase = getApiBase()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocorreu um erro. Tenta novamente.')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Não foi possível ligar ao servidor. Verifica a tua ligação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-['Jost',sans-serif] bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f7f3f9_100%)]">

      {/* Círculos decorativos */}
      <div className="absolute rounded-full border border-[rgba(212,83,126,0.08)] pointer-events-none"
        style={{ width: 600, height: 600, top: -200, left: -200, background: 'rgba(212, 83, 126, 0.03)' }} />
      <div className="absolute rounded-full border border-[rgba(212,83,126,0.08)] pointer-events-none"
        style={{ width: 400, height: 400, bottom: -150, right: -150, background: 'rgba(127, 119, 221, 0.03)' }} />

      {/* Botão voltar à página inicial */}
      <Link href="/" className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-[12px] text-[#9a9a9a] hover:text-[#D4537E] transition-colors duration-200 no-underline group">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Página inicial
      </Link>

      {/* Logo */}
      <div className="text-center -mt-16 mb-0.5 relative z-10">
        <Image
          src="/Logo.png"
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

        {/* Mensagem de erro vinda do backend */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-md bg-[rgba(212,83,126,0.06)] border border-[rgba(212,83,126,0.2)] text-[12px] text-[#c0405f]">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Email</label>
          <input
            type="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        {/* Palavra-passe */}
        <div className="mb-1.5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Palavra-passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        <Link href="/forgotpassword" className="block text-[12px] text-[#D4537E] hover:underline mb-0 mt-1">
          Esqueceste a palavra-passe?
        </Link>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 mt-6 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] border-none rounded-md text-white text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2.5 w-full my-6">
          <div className="flex-1 h-px bg-[#eeeeee]" />
          <span className="text-[#bbbbbb] text-xs">ou</span>
          <div className="flex-1 h-px bg-[#eeeeee]" />
        </div>

        <p className="text-sm text-[#7a7a7a]">
          Ainda não tens conta?{' '}
          <Link href="/signup" className="text-[#D4537E] font-medium no-underline hover:underline">
            Regista-te aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
