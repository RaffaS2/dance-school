'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)

  // Verifica se o token já expirou assim que a página carrega
  useEffect(() => {
    if (!token) {
      setTokenExpired(true)
      return
    }

    try {
      // O token JWT tem 3 partes separadas por "."
      // A segunda parte (payload) está em base64 e contém o "exp"
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000) // tempo atual em segundos
      if (payload.exp && payload.exp < now) {
        setTokenExpired(true)
      }
    } catch {
      setTokenExpired(true)
    }
  }, [token])

  const handleSubmit = async () => {
    setError('')

    if (!password || !confirm) {
      setError('Preenche todos os campos.')
      return
    }
    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As palavras-passe não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'Link inválido ou expirado.') {
          setTokenExpired(true)
          return
        }
        setError(data.error || 'Ocorreu um erro. Tenta novamente.')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError('Não foi possível ligar ao servidor.')
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

      {/* Botão voltar */}
      <Link href="/login" className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-[12px] text-[#9a9a9a] hover:text-[#D4537E] transition-colors duration-200 no-underline group">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar ao início de sessão
      </Link>

      {/* Logo */}
      <div className="text-center -mt-16 mb-0.5 relative z-10">
        <img src="/Logo.png" className="mx-auto block drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)]" width={280} height={280} alt="EntArtes Logo" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-[360px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#f0f0f0] rounded-xl px-8 py-10">

        {/* ── Estado: token expirado ── */}
        {tokenExpired ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(212,83,126,0.07)] flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#D4537E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </div>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">Link expirado</h2>
            <p className="text-[13px] text-[#7a7a7a] leading-relaxed mb-7">
              Este link de recuperação já expirou.<br />
              Pede um novo link para repores a tua palavra-passe.
            </p>
            <Link
              href="/forgotpassword"
              className="block w-full py-3.5 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] rounded-md text-white text-[11px] tracking-[0.2em] uppercase text-center no-underline transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)]"
            >
              Pedir novo link
            </Link>
          </div>

        ) : success ? (
          /* ── Estado: sucesso ── */
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(212,83,126,0.07)] flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#D4537E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">Palavra-passe alterada!</h2>
            <p className="text-[13px] text-[#7a7a7a] leading-relaxed mb-6">
              A tua palavra-passe foi atualizada com sucesso.<br />
              Serás redirecionado para o início de sessão.
            </p>
            <Link
              href="/login"
              className="block w-full py-3.5 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] rounded-md text-white text-[11px] tracking-[0.2em] uppercase text-center no-underline"
            >
              Ir para o início de sessão
            </Link>
          </div>

        ) : (
          /* ── Estado: formulário ── */
          <>
            <div className="w-11 h-11 rounded-full bg-[rgba(212,83,126,0.07)] flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#D4537E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7a4.5 4.5 0 10-9 0v3.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z" />
              </svg>
            </div>

            <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">Nova palavra-passe</h2>
            <p className="text-[13px] text-[#7a7a7a] mb-7 leading-relaxed">
              Escolhe uma nova palavra-passe para a tua conta.
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-md bg-[rgba(212,83,126,0.06)] border border-[rgba(212,83,126,0.2)] text-[12px] text-[#c0405f]">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Nova palavra-passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Confirmar palavra-passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] border-none rounded-md text-white text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'A guardar...' : 'Guardar palavra-passe'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
