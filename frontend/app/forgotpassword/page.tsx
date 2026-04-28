'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getApiBase } from '../lib/apiBase'

export default function ForgotPassword() {
  const apiBase = getApiBase()
  const [email, setEmail] = useState('')
  const [popupVisible, setPopupVisible] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')

    if (!email) {
      setError('Por favor introduz o teu email.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${apiBase}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocorreu um erro. Tenta novamente.')
        return
      }

      setPopupVisible(true)
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
        <img src="/Logo.png" className="mx-auto block drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)]" width={280} height={280} alt="EntArtes Logo" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-[360px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#f0f0f0] rounded-xl px-8 py-10">

        {/* Ícone de cadeado */}
        <div className="w-11 h-11 rounded-full bg-[rgba(212,83,126,0.07)] flex items-center justify-center mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#D4537E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7a4.5 4.5 0 10-9 0v3.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z" />
          </svg>
        </div>

        <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">Recuperar palavra-passe</h2>
        <p className="text-[13px] text-[#7a7a7a] mb-7 leading-relaxed">
          Indica o teu email e enviamos um link para repores a tua palavra-passe.
        </p>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-md bg-[rgba(212,83,126,0.06)] border border-[rgba(212,83,126,0.2)] text-[12px] text-[#c0405f]">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-6">
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#9a9a9a] mb-2">Email</label>
          <input
            type="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-[#fafafa] border border-[#eeeeee] rounded-md px-4 py-3 text-sm text-[#333] transition-all duration-300 focus:bg-white focus:border-[#D4537E] focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,83,126,0.05)]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] border-none rounded-md text-white text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'A enviar...' : 'Enviar link'}
        </button>

        {/* Voltar ao login */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#9a9a9a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <Link href="/login" className="text-[13px] text-[#7a7a7a] hover:text-[#D4537E] transition-colors duration-200">
            Voltar ao início de sessão
          </Link>
        </div>
      </div>

      {/* Popup de sucesso */}
      {popupVisible && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setPopupVisible(false)}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[340px] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-[#f0f0f0] px-8 py-10 text-center">

            <div className="w-12 h-12 rounded-full bg-[rgba(212,83,126,0.07)] flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#D4537E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
              </svg>
            </div>

            <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#1a1a1a] mb-1.5">Email enviado!</h2>
            <p className="text-[13px] text-[#7a7a7a] leading-relaxed mb-7">
              Verifica a tua caixa de entrada. O link expira em{' '}
              <span className="text-[#1a1a1a] font-medium">15 minutos</span>.
            </p>

            <p className="text-[12px] text-[#9a9a9a] mb-1">Não recebeste nada?</p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-[12px] text-[#D4537E] hover:underline bg-transparent border-none cursor-pointer p-0 mb-7 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'A enviar...' : 'Reenviar email'}
            </button>

            <Link
              href="/login"
              className="block w-full py-3.5 bg-gradient-to-br from-[#4a3a63] to-[#2d233c] rounded-md text-white text-[11px] tracking-[0.2em] uppercase text-center no-underline transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)]"
            >
              Ir para o início de sessão
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
