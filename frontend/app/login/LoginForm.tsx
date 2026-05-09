'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getApiBase } from '../lib/apiBase'

type SessionUser = {
  id_user: number;
  name: string;
  email: string;
  id_user_type: number;
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

      const meRes = await fetch(`${apiBase}/auth/me`, {
        credentials: 'include',
        cache: 'no-store',
      })

      const meData = await meRes.json()
      const user = meData.user as SessionUser

      const redirect = searchParams.get('redirect')

      if (redirect && redirect !== '/') {
        router.push(redirect)
      } else if (user.id_user_type === 1) {
        router.push('/admin/dashboard')
      } else if (user.id_user_type === 2 || user.id_user_type === 3) {
        router.push('/calendario')
      } else {
        router.push('/calendario')
      }

    } catch (err) {
      setError('Não foi possível ligar ao servidor. Verifica a tua ligação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-[90%] max-w-[360px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#f0f0f0] rounded-xl px-8 py-10">
      <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">
        Bem-vindo/a
      </h2>
      <p className="text-[13px] text-[#7a7a7a] mb-8">
        Acede à tua conta para continuar
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-md bg-[rgba(212,83,126,0.06)] border border-[rgba(212,83,126,0.2)] text-[12px] text-[#c0405f]">
          {error}
        </div>
      )}

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
  )
}
