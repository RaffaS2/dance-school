'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getApiBase } from '../lib/apiBase'

export default function Register() {
  const router = useRouter()
  const apiBase = getApiBase()

  const [name, setName] = useState('')
  const [apelido, setApelido] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [userType, setUserType] = useState('3')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')

    if (!name || !apelido || !email || !phone || !password || !confirmPassword) {
      setError('Por favor preenche todos os campos.')
      return
    }
    if (!/^\d{9,15}$/.test(phone)) {
      setError('Número de telefone inválido. Usa apenas dígitos (9 a 15).')
      return
    }
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.')
      return
    }
    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.')
      return
    }
    if (!terms) {
      setError('Tens de aceitar os Termos e Condições para continuar.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${name} ${apelido}`,
          email,
          phone_number: phone,
          password,
          id_user_type: parseInt(userType),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocorreu um erro. Tenta novamente.')
        return
      }

      // Se o backend indicar que a conta está pendente de aprovação
      if (data.pending) {
        router.push('/pendingapproval')
      } else {
        router.push('/login')
      }
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
      <div className="text-center -mt-8 mb-0.5 relative z-10">
        <img src="/Logo.png" className="mx-auto block drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)]" width={280} height={280} alt="EntArtes Logo" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-[400px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#f0f0f0] rounded-xl px-8 py-10">

        <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">Criar conta</h2>
        <p className="text-[13px] text-[#7a7a7a] mb-7">Junta-te à comunidade EntArtes</p>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-md bg-[rgba(212,83,126,0.06)] border border-[rgba(212,83,126,0.2)] text-[12px] text-[#c0405f]">
            {error}
          </div>
        )}

        {/* Nome e Apelido */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Nome</label>
            <input
              type="text"
              placeholder="João"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Apelido</label>
            <input
              type="text"
              placeholder="Silva"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
            />
          </div>
        </div>

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

        {/* Número de Telefone */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Número de Telefone</label>
          <input
            type="tel"
            placeholder="912 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        {/* Cargo */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Cargo</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)] cursor-pointer"
          >
            <option value="3">Encarregado de Educação</option>
            <option value="2">Professor</option>
          </select>
        </div>

        {/* Aviso para Professores */}
        {userType === '2' && (
          <div className="mb-5 px-4 py-3 rounded-md bg-[rgba(212,83,126,0.06)] border border-[rgba(212,83,126,0.15)] text-[12px] text-[#7a5a6a]">
            <span className="mr-1">⚠️</span>
            As contas de Professor requerem aprovação da coordenação. Receberás um email quando a tua conta for ativada.
          </div>
        )}

        {/* Palavra-passe */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Palavra-passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        {/* Confirmar Palavra-passe */}
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Confirmar Palavra-passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        {/* Termos e condições */}
        <div className="flex items-start gap-2.5 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#D4537E] cursor-pointer shrink-0"
          />
          <label htmlFor="terms" className="text-[12px] text-[#7a7a7a] leading-relaxed cursor-pointer">
            Aceito os{' '}
            <a href="#" className="text-[#D4537E] hover:underline">Termos e Condições</a>
            {' '}e a{' '}
            <a href="#" className="text-[#D4537E] hover:underline">Política de Privacidade</a>
          </label>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] border-none rounded-md text-white text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'A criar conta...' : 'Criar Conta'}
        </button>

        {/* Divider */}
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